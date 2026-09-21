from datetime import date
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Software
from .serializers import SoftwareSerializer
from monetizacion.models import BoletaSuscripcion

class SoftwareViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, crear, obtener, actualizar y eliminar Softwares autorizados a evaluar.
    Incluye validación estricta de límite de 2 softwares registrados en plan gratuito por defecto para Pentesters.
    """
    queryset = Software.objects.all()
    serializer_class = SoftwareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_software_limit(self, user, instance=None, new_status=None):
        """
        Valida que los usuarios con rol PENTESTER en plan gratuito/trial (o sin boleta de pago activa)
        no puedan superar el límite máximo de 2 softwares registrados.
        """
        if user.role == 'PENTESTER' and not (user.is_staff or user.is_superuser):
            today = date.today()
            # Buscar boletas vigentes a la fecha de hoy
            active_boletas = BoletaSuscripcion.objects.filter(
                pentester=user,
                fecha_inicio__lte=today,
                fecha_fin__gte=today,
                plan__tarifa__monto__gt=0
            )

            # Comprobar si al menos una boleta pertenece a un plan de pago real (no Free/Trial/Starter)
            has_paid_active_sub = False
            for boleta in active_boletas:
                plan_name = boleta.plan.nombre.lower() if boleta.plan else ''
                if not any(k in plan_name for k in ['free', 'gratuito', 'trial', 'starter']):
                    has_paid_active_sub = True
                    break

            if not has_paid_active_sub:
                if instance is None:
                    # En creación: contar softwares ya registrados por el usuario
                    total_count = Software.objects.filter(user=user).count()
                    if total_count >= 2:
                        raise PermissionDenied(
                            "Límite del Plan Gratuito/Trial alcanzado. En este plan solo puedes registrar hasta 2 softwares/objetivos. "
                            "Para registrar más de 2 softwares, debes suscribirte a un plan superior (Professional o Enterprise) en el módulo de Monetización."
                        )
                else:
                    # En actualización: verificar que no exceda 2 softwares
                    other_count = Software.objects.filter(user=user).exclude(id=instance.id).count()
                    if other_count >= 2 and new_status == 'Activo':
                        raise PermissionDenied(
                            "Límite del Plan Gratuito/Trial alcanzado. Solo puedes tener hasta 2 softwares registrados en el plan gratuito. "
                            "Por favor actualiza tu plan en el módulo de Monetización para registrar o activar más softwares."
                        )

    def perform_create(self, serializer):
        user = self.request.user
        self.check_software_limit(user)
        serializer.save(user=user)

    def perform_update(self, serializer):
        user = self.request.user
        new_status = serializer.validated_data.get('status', serializer.instance.status)
        self.check_software_limit(user, instance=serializer.instance, new_status=new_status)
        serializer.save()

