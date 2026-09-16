from rest_framework import permissions

class IsSystemAdminOrReadOnly(permissions.BasePermission):
    """
    Permite lectura a cualquier usuario autenticado, pero exige rol SYSTEM_ADMIN para crear, actualizar o eliminar.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return request.user.role == 'SYSTEM_ADMIN' or request.user.is_staff


class IsPentesterForCreateOrAdminForList(permissions.BasePermission):
    """
    Control de acceso para Boletas de Suscripción:
    - Registro (POST): Permitido para PENTESTER (y SYSTEM_ADMIN).
    - Lectura (GET): Permitido a usuarios autenticados.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method == 'POST':
            # Solo PENTESTER (o SYSTEM_ADMIN) puede registrar boletas
            return request.user.role in ['PENTESTER', 'SYSTEM_ADMIN'] or request.user.is_staff

        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.role == 'SYSTEM_ADMIN' or request.user.is_staff:
            return True

        # Pentesters solo ven/interactúan con sus propias boletas
        return obj.pentester == request.user
