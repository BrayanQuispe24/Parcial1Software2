import uuid
from datetime import date, timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from monetizacion.models import Plan, BoletaSuscripcion

User = get_user_model()

@receiver(post_save, sender=User)
def assign_free_trial_plan_to_pentester(sender, instance, created, **kwargs):
    """
    Signal que escucha la creación de nuevos usuarios.
    Si el nuevo usuario posee rol PENTESTER, le asigna automáticamente
    una Boleta de Suscripción para el 'Plan Gratuito Trial' de 10 días.
    """
    if created and instance.role == 'PENTESTER':
        try:
            # Obtener el Plan Gratuito Trial de 10 días
            plan_gratuito = Plan.objects.filter(nombre__icontains="Plan Gratuito").first()
            if not plan_gratuito:
                plan_gratuito = Plan.objects.filter(duracion_dias=10).first()

            if plan_gratuito:
                today = date.today()
                fecha_fin = today + timedelta(days=plan_gratuito.duracion_dias)
                numero_boleta = f"FREE-TRIAL-{uuid.uuid4().hex[:8].upper()}"

                BoletaSuscripcion.objects.get_or_create(
                    pentester=instance,
                    defaults={
                        'numero_boleta': numero_boleta,
                        'fecha_inicio': today,
                        'fecha_fin': fecha_fin,
                        'plan': plan_gratuito,
                    }
                )
                print(f"✓ Asignado Plan Gratuito Trial (10 días) a nuevo Pentester: {instance.username} (#{numero_boleta})")
        except Exception as e:
            print(f"Error asignando plan gratuito trial a {instance.username}: {e}")
