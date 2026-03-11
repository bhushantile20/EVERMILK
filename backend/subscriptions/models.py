from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

class Subscription(models.Model):
    PLAN_CHOICES = [
        ('daily', 'Daily'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES)
    price_per_delivery = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percent = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.custom_id} - {self.user.username}"
        
    @property
    def custom_id(self):
        return f"S{str(self.id).zfill(3)}"
        
    @property
    def next_delivery_date(self):
        next_del = self.deliveries.filter(status='pending').order_by('delivery_date').first()
        return next_del.delivery_date if next_del else None


class DeliverySchedule(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('delivered', 'Delivered'),
        ('skipped', 'Skipped'),
    ]
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='deliveries')
    delivery_date = models.DateField()
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Delivery for Sub #{self.subscription.id} on {self.delivery_date}"


class DeliveryPause(models.Model):
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='pauses')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Pause for Sub #{self.subscription.id} from {self.start_date} to {self.end_date}"
