from datetime import date
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Software
from .serializers import SoftwareSerializer
from monetizacion.models import BoletaSuscripcion

class SoftwareViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, crear, obtener, actualizar y eliminar Softwares autorizados a evaluar.
    Incluye validación estricta de límite de 2 softwares activos en plan gratuito para Pentesters.
    """
    queryset = Software.objects.all()
    serializer_class = SoftwareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        new_status = serializer.validated_data.get('status', 'Activo')

        # Control estricto de cuota para rol PENTESTER
        if user.role == 'PENTESTER' and not (user.is_staff or user.is_superuser) and new_status == 'Activo':
            today = date.today()
            # Verificar si posee boleta de suscripción activa vigente a la fecha de hoy
            has_active_sub = BoletaSuscripcion.objects.filter(
                pentester=user,
                fecha_inicio__lte=today,
                fecha_fin__gte=today
            ).exists()

            if not has_active_sub:
                # Contar softwares activos del usuario (sin contar inactivos ni eliminados)
                active_count = Software.objects.filter(user=user, status='Activo').count()
                if active_count >= 2:
                    raise PermissionDenied(
                        "Límite de plan gratuito alcanzado. Solo puedes registrar hasta 2 softwares activos. "
                        "Por favor, actualiza tu plan de suscripción en el módulo de Monetización para registrar más softwares."
                    )

        serializer.save(user=user)
