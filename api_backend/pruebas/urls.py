from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SoftwareViewSet

from .ai_proxy_views import (
    IniciarEscaneoIAProxyView,
    InformeSeguridadProxyView,
    IniciarAtaqueIAProxyView,
    DetalleAtaqueIAProxyView,
    SaludIAProxyView,
    ListarEscaneosIAProxyView,
    ObservacionesEscaneoIAProxyView,
    DetalleEscaneoIAProxyView
)

router = DefaultRouter()
router.register(r'software', SoftwareViewSet, basename='software')

urlpatterns = [
    path('', include(router.urls)),
    # Rutas bajo /api/ia/
    path('ia/escaneo/', IniciarEscaneoIAProxyView.as_view(), name='ia-escaneo'),
    path('ia/escaneos/', ListarEscaneosIAProxyView.as_view(), name='ia-escaneos-lista'),
    path('ia/escaneos/<uuid:scan_id>/', DetalleEscaneoIAProxyView.as_view(), name='ia-escaneo-detalle'),
    path('ia/escaneos/<uuid:scan_id>/observaciones/', ObservacionesEscaneoIAProxyView.as_view(), name='ia-escaneo-observaciones'),
    path('ia/informe/', InformeSeguridadProxyView.as_view(), name='ia-informe'),
    path('ia/ataque/', IniciarAtaqueIAProxyView.as_view(), name='ia-ataque'),
    path('ia/ataque/<uuid:session_id>/', DetalleAtaqueIAProxyView.as_view(), name='ia-ataque-detalle'),
    path('ia/salud/', SaludIAProxyView.as_view(), name='ia-salud'),

    # Rutas alias bajo /api/pruebas/ia/
    path('pruebas/ia/escaneo/', IniciarEscaneoIAProxyView.as_view(), name='pruebas-ia-escaneo'),
    path('pruebas/ia/escaneos/', ListarEscaneosIAProxyView.as_view(), name='pruebas-ia-escaneos-lista'),
    path('pruebas/ia/escaneos/<uuid:scan_id>/', DetalleEscaneoIAProxyView.as_view(), name='pruebas-ia-escaneo-detalle'),
    path('pruebas/ia/escaneos/<uuid:scan_id>/observaciones/', ObservacionesEscaneoIAProxyView.as_view(), name='pruebas-ia-escaneo-observaciones'),
    path('pruebas/ia/informe/', InformeSeguridadProxyView.as_view(), name='pruebas-ia-informe'),
    path('pruebas/ia/ataque/', IniciarAtaqueIAProxyView.as_view(), name='pruebas-ia-ataque'),
    path('pruebas/ia/ataque/<uuid:session_id>/', DetalleAtaqueIAProxyView.as_view(), name='pruebas-ia-ataque-detalle'),
    path('pruebas/ia/salud/', SaludIAProxyView.as_view(), name='pruebas-ia-salud'),
]



