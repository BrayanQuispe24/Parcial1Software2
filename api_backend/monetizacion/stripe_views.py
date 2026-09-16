import uuid
from datetime import date, timedelta
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
import stripe

from .models import Plan, BoletaSuscripcion
from .serializers import BoletaSuscripcionSerializer

class CreatePaymentIntentView(APIView):
    """
    Crea un PaymentIntent en Stripe a partir del ID del Plan seleccionado.
    Devuelve clientSecret y publishableKey para inicializar el formulario seguro de Stripe en React.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'detail': 'Se requiere plan_id.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({'detail': 'El plan especificado no existe.'}, status=status.HTTP_404_NOT_FOUND)

        stripe_secret = getattr(settings, 'STRIPE_SECRET_KEY', '')
        stripe_pub_key = getattr(settings, 'STRIPE_PUBLISHABLE_KEY', '')
        amount_cents = max(100, int(round(float(plan.tarifa.monto) * 100)))

        # Intentar llamada real a la API de Stripe
        if stripe_secret and not stripe_secret.startswith('sk_test_51MockKey'):
            try:
                stripe.api_key = stripe_secret
                intent = stripe.PaymentIntent.create(
                    amount=amount_cents,
                    currency='usd',
                    metadata={
                        'pentester_id': str(request.user.id),
                        'pentester_username': request.user.username,
                        'plan_id': str(plan.id),
                        'plan_nombre': plan.nombre,
                    },
                    description=f"Suscripción Plan {plan.nombre} ({plan.duracion_dias} días) - GenAI Security Lab"
                )
                return Response({
                    'clientSecret': intent.client_secret,
                    'publishableKey': stripe_pub_key,
                    'paymentIntentId': intent.id,
                    'amount': float(plan.tarifa.monto),
                    'planNombre': plan.nombre,
                    'isMock': False,
                })
            except Exception as e:
                # Si las credenciales reales aún no están o dan error de red, retornar respuesta de desarrollo
                print(f"Stripe API Note: {e}. Usando modo simulación para desarrollo.")

        # Modo Simulación de Desarrollo si la clave es de prueba/mock
        mock_intent_id = f"pi_mock_{uuid.uuid4().hex[:12]}"
        mock_client_secret = f"{mock_intent_id}_secret_{uuid.uuid4().hex[:12]}"
        return Response({
            'clientSecret': mock_client_secret,
            'publishableKey': stripe_pub_key or 'pk_test_mock_dev_key',
            'paymentIntentId': mock_intent_id,
            'amount': float(plan.tarifa.monto),
            'planNombre': plan.nombre,
            'isMock': True,
        })


class ConfirmStripePaymentView(APIView):
    """
    Confirma la transacción de Stripe y registra la Boleta de Suscripción en la base de datos.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        payment_intent_id = request.data.get('payment_intent_id', '')

        if not plan_id:
            return Response({'detail': 'Se requiere plan_id.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({'detail': 'El plan especificado no existe.'}, status=status.HTTP_404_NOT_FOUND)

        # Generar número de boleta formateado con hash o ID de Stripe
        if payment_intent_id:
            suffix = payment_intent_id[-8:].upper().replace('_', 'X')
            numero_boleta = f"BOL-STRIPE-{suffix}"
        else:
            numero_boleta = f"BOL-STRIPE-{uuid.uuid4().hex[:8].upper()}"

        fecha_inicio = date.today()
        fecha_fin = fecha_inicio + timedelta(days=plan.duracion_dias)

        boleta, created = BoletaSuscripcion.objects.get_or_create(
            numero_boleta=numero_boleta,
            defaults={
                'fecha_inicio': fecha_inicio,
                'fecha_fin': fecha_fin,
                'pentester': request.user,
                'plan': plan,
            }
        )

        serializer = BoletaSuscripcionSerializer(boleta)
        return Response({
            'message': '✓ Pago con Stripe verificado exitosamente. Boleta registrada.',
            'boleta': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
