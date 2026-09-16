from django.db import models
from django.conf import settings

class Tarifa(models.Model):
    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre de la Tarifa"
    )
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Monto ($ USD)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tarifa"
        verbose_name_plural = "Tarifas"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nombre} - ${self.monto}"


class Plan(models.Model):
    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre del Plan"
    )
    duracion_dias = models.PositiveIntegerField(
        default=30,
        help_text="Duración del plan en días (ej. 30 para 1 mes, 365 para 1 año)",
        verbose_name="Duración en Días"
    )
    tarifa = models.ForeignKey(
        Tarifa,
        on_delete=models.CASCADE,
        related_name='planes',
        verbose_name="Tarifa Asociada"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Plan"
        verbose_name_plural = "Planes"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nombre} ({self.duracion_dias} días) - {self.tarifa.nombre}"


class BoletaSuscripcion(models.Model):
    numero_boleta = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Número de Boleta"
    )
    fecha_inicio = models.DateField(
        verbose_name="Fecha de Inicio"
    )
    fecha_fin = models.DateField(
        verbose_name="Fecha de Fin"
    )
    pentester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='boletas_suscripcion',
        verbose_name="Pentester Titular"
    )
    plan = models.ForeignKey(
        Plan,
        on_delete=models.CASCADE,
        related_name='boletas',
        verbose_name="Plan Suscrito"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Boleta de Suscripción"
        verbose_name_plural = "Boletas de Suscripción"
        ordering = ['-created_at']

    def __str__(self):
        return f"Boleta #{self.numero_boleta} - {self.pentester.username} ({self.plan.nombre})"
