from rest_framework.permissions import BasePermission
from .models import Role

class IsSystemAdmin(BasePermission):
    """Permite el acceso únicamente al Administrador del Sistema."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_enabled and
            (request.user.role == Role.SYSTEM_ADMIN or request.user.is_superuser)
        )

class IsPentester(BasePermission):
    """Permite el acceso a usuarios con rol Pentester habilitados."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_enabled and
            request.user.role == Role.PENTESTER
        )

class IsAuditor(BasePermission):
    """Permite el acceso a usuarios con rol Auditor habilitados."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_enabled and
            request.user.role == Role.AUDITOR
        )
