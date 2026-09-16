from django.db import migrations

def insert_free_plan(apps, schema_editor):
    Tarifa = apps.get_model('monetizacion', 'Tarifa')
    Plan = apps.get_model('monetizacion', 'Plan')

    tarifa_gratuita, _ = Tarifa.objects.get_or_create(
        nombre="Tarifa Gratuita",
        defaults={'monto': 0.00}
    )

    Plan.objects.get_or_create(
        nombre="Plan Gratuito Trial",
        defaults={
            'duracion_dias': 10,
            'tarifa': tarifa_gratuita,
        }
    )

def remove_free_plan(apps, schema_editor):
    Tarifa = apps.get_model('monetizacion', 'Tarifa')
    Plan = apps.get_model('monetizacion', 'Plan')
    Plan.objects.filter(nombre="Plan Gratuito Trial").delete()
    Tarifa.objects.filter(nombre="Tarifa Gratuita").delete()

class Migration(migrations.Migration):

    dependencies = [
        ('monetizacion', '0002_remove_plan_tiempo_plan_duracion_dias'),
    ]

    operations = [
        migrations.RunPython(insert_free_plan, reverse_code=remove_free_plan),
    ]
