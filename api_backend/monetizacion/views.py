from rest_framework import viewsets, permissions
from .models import Tarifa, Plan, BoletaSuscripcion
from .serializers import TarifaSerializer, PlanSerializer, BoletaSuscripcionSerializer
from .permissions import IsSystemAdminOrReadOnly, IsPentesterForCreateOrAdminForList

class TarifaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión de Tarifas.
    - Creación/Edición/Eliminación: Solo Administrador del Sistema.
    - Lectura: Todos los usuarios autenticados.
    """
    queryset = Tarifa.objects.all()
    serializer_class = TarifaSerializer
    permission_classes = [IsSystemAdminOrReadOnly]


class PlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión de Planes.
    - Creación/Edición/Eliminación: Solo Administrador del Sistema.
    - Lectura: Todos los usuarios autenticados.
    """
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [IsSystemAdminOrReadOnly]


class BoletaSuscripcionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para las Boletas de Suscripción.
    - Registro (POST): Exclusivo para Pentesters (se asigna automáticamente su cuenta).
    - Lectura (GET):
      * SYSTEM_ADMIN: Ve todas las boletas registradas en la plataforma.
      * PENTESTER: Ve únicamente sus propias boletas de suscripción.
    """
    serializer_class = BoletaSuscripcionSerializer
    permission_classes = [IsPentesterForCreateOrAdminForList]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return BoletaSuscripcion.objects.none()

        if user.role == 'SYSTEM_ADMIN' or user.is_staff:
            return BoletaSuscripcion.objects.all()

        # Pentester solo ve sus propias boletas
        return BoletaSuscripcion.objects.filter(pentester=user)

    def perform_create(self, serializer):
        serializer.save(pentester=self.request.user)
