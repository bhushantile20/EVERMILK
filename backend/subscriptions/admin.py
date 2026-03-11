from django.contrib import admin
from .models import Subscription, DeliverySchedule, DeliveryPause

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'plan_type', 'status', 'start_date', 'end_date', 'total_amount')
    list_filter = ('status', 'plan_type')
    search_fields = ('user__username', 'user__email', 'product__name')

@admin.register(DeliverySchedule)
class DeliveryScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'subscription', 'delivery_date', 'quantity', 'status')
    list_filter = ('status', 'delivery_date')
    search_fields = ('subscription__user__username',)

@admin.register(DeliveryPause)
class DeliveryPauseAdmin(admin.ModelAdmin):
    list_display = ('id', 'subscription', 'start_date', 'end_date')
    search_fields = ('subscription__user__username',)
