"""
Admin analytics views for Milkman.
Endpoint: GET /api/admin/analytics/
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import timedelta

from orders.models import Order
from payments.models import Payment


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_analytics(request):
    """
    Returns revenue and order analytics for the admin dashboard.
    """
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    # ── Totals ──
    total_orders = Order.objects.count()
    total_revenue = Payment.objects.filter(status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0

    pending_orders = Order.objects.filter(status='pending').count()
    delivered_orders = Order.objects.filter(status='delivered').count()
    cancelled_orders = Order.objects.filter(status='cancelled').count()

    # ── Monthly stats (last 30 days) ──
    monthly_revenue = Payment.objects.filter(
        status='completed',
        paid_at__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0

    monthly_orders = Order.objects.filter(
        created_at__gte=thirty_days_ago
    ).count()

    # ── Daily revenue for last 30 days (for chart) ──
    daily_data = []
    for i in range(29, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_revenue = Payment.objects.filter(
            status='completed',
            paid_at__gte=day_start,
            paid_at__lt=day_end,
        ).aggregate(total=Sum('amount'))['total'] or 0
        day_orders = Order.objects.filter(
            created_at__gte=day_start,
            created_at__lt=day_end,
        ).count()
        daily_data.append({
            'date': day_start.strftime('%d %b'),
            'revenue': float(day_revenue),
            'orders': day_orders,
        })

    # ── Orders by status (for pie chart) ──
    orders_by_status = list(
        Order.objects.values('status').annotate(count=Count('id'))
    )

    return Response({
        'totals': {
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'pending_orders': pending_orders,
            'delivered_orders': delivered_orders,
            'cancelled_orders': cancelled_orders,
        },
        'monthly': {
            'revenue': float(monthly_revenue),
            'orders': monthly_orders,
        },
        'daily_chart': daily_data,
        'orders_by_status': orders_by_status,
    })
