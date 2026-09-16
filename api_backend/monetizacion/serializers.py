from rest_framework import serializers
from .models import Tarifa, Plan, BoletaSuscripcion

class TarifaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarifa
        fields = ['id', 'nombre', 'monto', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlanSerializer(serializers.ModelSerializer):
    tarifa_nombre = serializers.ReadOnlyField(source='tarifa.nombre')
    tarifa_monto = serializers.ReadOnlyField(source='tarifa.monto')

    class Meta:
        model = Plan
        fields = [
            'id',
            'nombre',
            'duracion_dias',
            'tarifa',
            'tarifa_nombre',
            'tarifa_monto',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BoletaSuscripcionSerializer(serializers.ModelSerializer):
    pentester_username = serializers.ReadOnlyField(source='pentester.username')
    pentester_email = serializers.ReadOnlyField(source='pentester.email')
    plan_nombre = serializers.ReadOnlyField(source='plan.nombre')
    plan_duracion_dias = serializers.ReadOnlyField(source='plan.duracion_dias')
    plan_monto = serializers.ReadOnlyField(source='plan.tarifa.monto')

    class Meta:
        model = BoletaSuscripcion
        fields = [
            'id',
            'numero_boleta',
            'fecha_inicio',
            'fecha_fin',
            'pentester',
            'pentester_username',
            'pentester_email',
            'plan',
            'plan_nombre',
            'plan_duracion_dias',
            'plan_monto',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'pentester', 'created_at', 'updated_at']
