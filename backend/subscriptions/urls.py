from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_subscription, name='create_subscription'),
    path('my/', views.my_subscriptions, name='my_subscriptions'),
    path('pause/', views.pause_subscription, name='pause_subscription'),
    path('resume/', views.resume_subscription, name='resume_subscription'),
    path('<int:sub_id>/deliveries/', views.subscription_deliveries, name='subscription_deliveries'),
    
    # Admin URLs
    path('admin/all/', views.admin_list_subscriptions, name='admin_list_subscriptions'),
    path('admin/<int:sub_id>/', views.admin_subscription_detail, name='admin_subscription_detail'),
    path('admin/<int:sub_id>/cancel/', views.admin_cancel_subscription, name='admin_cancel_subscription'),
    path('admin/<int:sub_id>/delete/', views.admin_delete_subscription, name='admin_delete_subscription'),
]
