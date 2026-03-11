from datetime import timedelta
from .models import DeliverySchedule

def generate_delivery_schedule(subscription):
    """
    Generates delivery schedules for a subscription based on its plan_type.
    Uses the subscription's start_date and duration.
    """
    plan_type = subscription.plan_type
    start_date = subscription.start_date
    quantity = subscription.quantity
    
    if plan_type == 'daily':
        duration = 1
    elif plan_type == 'monthly':
        duration = 30
    elif plan_type == 'quarterly':
        duration = 90
    elif plan_type == 'yearly':
        duration = 365
    else:
        duration = 1
        
    deliveries = []
    for i in range(duration):
        del_date = start_date + timedelta(days=i)
        deliveries.append(DeliverySchedule(
            subscription=subscription,
            delivery_date=del_date,
            quantity=quantity
        ))
        
    DeliverySchedule.objects.bulk_create(deliveries)
    return deliveries
