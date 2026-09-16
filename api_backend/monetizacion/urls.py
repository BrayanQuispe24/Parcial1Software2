from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TarifaViewSet, PlanViewSet, BoletaSuscripcionViewSet
from .stripe_views import CreatePaymentIntentView, ConfirmStripePaymentView

router = DefaultRouter()
router.register(r'tarifas', TarifaViewSet, basename='tarifa')
router.register(r'planes', PlanViewSet, basename='plan')
router.register(r'boletas', BoletaSuscripcionViewSet, basename='boleta')

urlpatterns = [
    path('', include(router.urls)),
    path('stripe/create-payment-intent/', CreatePaymentIntentView.as_view(), name='stripe-create-payment-intent'),
    path('stripe/confirm-payment/', ConfirmStripePaymentView.as_view(), name='stripe-confirm-payment'),
]

