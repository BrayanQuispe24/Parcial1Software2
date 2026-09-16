from django.contrib.auth.models import AbstractUser
from django.db import models

class Role(models.TextChoices):
    SYSTEM_ADMIN = 'SYSTEM_ADMIN', 'Administrador del Sistema'
    PENTESTER = 'PENTESTER', 'Pentester'
    AUDITOR = 'AUDITOR', 'Auditor'

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PENTESTER,
        help_text="Rol asignado al usuario en GenAI Security Lab"
    )
    is_enabled = models.BooleanField(
        default=False,
        help_text="Indica si la cuenta fue activada por el Administrador del Sistema"
    )
    accepted_terms = models.BooleanField(
        default=False,
        help_text="Indica si el usuario aceptó los Términos y Condiciones"
    )
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_users',
        help_text="Usuario Pentester que creó este usuario (para Auditores)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()}) - {'Habilitado' if self.is_enabled else 'Pendiente'}"
