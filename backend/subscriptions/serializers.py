from rest_framework import serializers
from .models import Subscription, DeliverySchedule, DeliveryPause
from products.serializers import ProductSerializer

class DeliveryScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliverySchedule
        fields = '__all__'

class DeliveryPauseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPause
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    custom_id = serializers.CharField(read_only=True)
    next_delivery_date = serializers.DateField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'

class AdminSubscriptionListSerializer(serializers.ModelSerializer):
    subscription_id = serializers.CharField(source='custom_id')
    customer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    amount = serializers.DecimalField(source='total_amount', max_digits=10, decimal_places=2)
    next_delivery_date = serializers.DateField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'subscription_id', 'customer_name', 'phone_number', 
            'product_name', 'plan_type', 'amount', 'status', 
            'start_date', 'end_date', 'next_delivery_date'
        ]

class CreateSubscriptionSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    plan_type = serializers.ChoiceField(choices=['daily', 'monthly', 'quarterly', 'yearly'])
    start_date = serializers.DateField()

class PauseSubscriptionSerializer(serializers.Serializer):
    subscription_id = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    reason = serializers.CharField(required=False, allow_blank=True)

class ResumeSubscriptionSerializer(serializers.Serializer):
    subscription_id = serializers.IntegerField()
