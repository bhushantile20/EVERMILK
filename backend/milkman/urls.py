from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from milkman.analytics import admin_analytics

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/addresses/', include('addresses.urls')),
    path('api/admin/analytics/', admin_analytics, name='admin_analytics'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
