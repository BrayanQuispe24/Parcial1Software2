from django.db import models
from django.conf import settings

class ProtocolChoices(models.TextChoices):
    HTTP_HTTPS = 'HTTP/HTTPS', 'HTTP/HTTPS'
    WEBSOCKET = 'WebSocket', 'WebSocket'
    STT_AUDIO = 'STT/Audio', 'STT/Audio'

class StatusChoices(models.TextChoices):
    ACTIVO = 'Activo', 'Activo'
    INACTIVO = 'Inactivo', 'Inactivo'
    MAPEANDO = 'Mapeando', 'Mapeando'

class Software(models.Model):
    name = models.CharField(
        max_length=150,
        verbose_name="Nombre del Software / Chatbot"
    )
    endpoint = models.CharField(
        max_length=500,
        verbose_name="Endpoint URL / WebSocket"
    )
    protocol = models.CharField(
        max_length=20,
        choices=ProtocolChoices.choices,
        default=ProtocolChoices.HTTP_HTTPS,
        verbose_name="Protocolo"
    )
    llm_provider = models.CharField(
        max_length=100,
        verbose_name="Proveedor / Modelo LLM"
    )
    system_prompt_sample = models.TextField(
        blank=True,
        null=True,
        verbose_name="Muestra de System Prompt"
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVO,
        verbose_name="Estado"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='softwares',
        verbose_name="Usuario Registrador"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Software Objetivo"
        verbose_name_plural = "Softwares Objetivos"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.protocol}) - {self.status}"
