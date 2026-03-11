from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from .models import Subscription, DeliverySchedule, DeliveryPause
from .serializers import (
    SubscriptionSerializer, DeliveryScheduleSerializer,
    CreateSubscriptionSerializer, PauseSubscriptionSerializer,
    ResumeSubscriptionSerializer, AdminSubscriptionListSerializer
)
from .services import generate_delivery_schedule
from products.models import Product
from orders.models import Order, OrderItem

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_subscription(request):
    serializer = CreateSubscriptionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    product = get_object_or_404(Product, id=data['product_id'])
    
    plan_type = data['plan_type']
    quantity = data['quantity']
    start_date = data['start_date']
    
    # Pricing logic
    base_price = product.one_time_price
    
    if plan_type == 'daily':
        discount_percent = 0
        duration = 1
        end_date = start_date + timedelta(days=0)
    elif plan_type == 'monthly':
        discount_percent = 10
        duration = 30
        end_date = start_date + timedelta(days=29)
    elif plan_type == 'quarterly':
        discount_percent = 15
        duration = 90
        end_date = start_date + timedelta(days=89)
    elif plan_type == 'yearly':
        discount_percent = 25
        duration = 365
        end_date = start_date + timedelta(days=364)
    else:
        discount_percent = 0
        duration = 1
        end_date = start_date
        
    price_per_delivery = base_price * (100 - discount_percent) / 100
    total_amount = price_per_delivery * duration * quantity
    
    try:
        with transaction.atomic():
            sub = Subscription.objects.create(
                user=request.user,
                product=product,
                quantity=quantity,
                plan_type=plan_type,
                price_per_delivery=price_per_delivery,
                discount_percent=discount_percent,
                start_date=start_date,
                end_date=end_date,
                total_amount=total_amount
            )
            
            # Generate deliveries using the service
            generate_delivery_schedule(sub)
            
            # Create Order to allow payment flow to work smoothly without altering original APIs
            address = request.user.addresses.filter(is_default=True).first()
            shipping_address = f"{address.address_line}, {address.city}" if address else "Digital Delivery / Pick Up"
            
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                shipping_address=shipping_address
            )
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity * duration, 
                plan_type=plan_type,
                price_at_purchase=price_per_delivery
            )
            
        return Response({
            'subscription': SubscriptionSerializer(sub).data,
            'order_id': order.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_subscriptions(request):
    subs = Subscription.objects.filter(user=request.user).order_by('-created_at')
    return Response(SubscriptionSerializer(subs, many=True).data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def pause_subscription(request):
    serializer = PauseSubscriptionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    sub = get_object_or_404(Subscription, id=serializer.validated_data['subscription_id'], user=request.user)
    
    if sub.status != 'active':
        return Response({'error': 'Subscription is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
    start = serializer.validated_data['start_date']
    end = serializer.validated_data['end_date']
    
    with transaction.atomic():
        DeliveryPause.objects.create(
            subscription=sub,
            start_date=start,
            end_date=end,
            reason=serializer.validated_data.get('reason', '')
        )
        sub.status = 'paused'
        sub.save()
        
        # update delivery schedules to skipped
        DeliverySchedule.objects.filter(
            subscription=sub,
            delivery_date__range=[start, end],
            status='pending'
        ).update(status='skipped')
        
    return Response({'message': 'Subscription paused', 'subscription': SubscriptionSerializer(sub).data})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resume_subscription(request):
    serializer = ResumeSubscriptionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    sub = get_object_or_404(Subscription, id=serializer.validated_data['subscription_id'], user=request.user)
    if sub.status != 'paused':
        return Response({'error': 'Subscription is not paused'}, status=status.HTTP_400_BAD_REQUEST)
        
    with transaction.atomic():
        sub.status = 'active'
        sub.save()
        
        today = timezone.now().date()
        DeliverySchedule.objects.filter(
            subscription=sub,
            status='skipped',
            delivery_date__gte=today
        ).update(status='pending')
    
    return Response({'message': 'Subscription resumed', 'subscription': SubscriptionSerializer(sub).data})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def subscription_deliveries(request, sub_id):
    sub = get_object_or_404(Subscription, id=sub_id, user=request.user)
    deliveries = DeliverySchedule.objects.filter(subscription=sub).order_by('delivery_date')
    return Response(DeliveryScheduleSerializer(deliveries, many=True).data)

# --- ADMIN ENDPOINTS ---

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_list_subscriptions(request):
    subs = Subscription.objects.select_related('user', 'product').all().order_by('-created_at')
    return Response(AdminSubscriptionListSerializer(subs, many=True).data)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_subscription_detail(request, sub_id):
    sub = get_object_or_404(Subscription, id=sub_id)
    deliveries = DeliverySchedule.objects.filter(subscription=sub).order_by('delivery_date')
    return Response({
        'subscription': SubscriptionSerializer(sub).data,
        'deliveries': DeliveryScheduleSerializer(deliveries, many=True).data
    })

@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def admin_cancel_subscription(request, sub_id):
    sub = get_object_or_404(Subscription, id=sub_id)
    if sub.status == 'cancelled':
        return Response({'error': 'Subscription already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        
    with transaction.atomic():
        sub.status = 'cancelled'
        sub.save()
        
        # Mark pending deliveries as skipped or cancelled
        DeliverySchedule.objects.filter(
            subscription=sub,
            status='pending'
        ).update(status='skipped')
        
    return Response({'message': 'Subscription cancelled successfully'})

@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def admin_delete_subscription(request, sub_id):
    sub = get_object_or_404(Subscription, id=sub_id)
    sub.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
