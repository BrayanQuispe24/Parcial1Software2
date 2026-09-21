from datetime import date
import requests
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from monetizacion.models import BoletaSuscripcion
from .models import Software

AI_MICROSERVICE_URL = getattr(settings, 'AI_MICROSERVICE_URL', 'http://127.0.0.1:8001/api').rstrip('/')



def es_pentester_o_admin(user):
    """
    Verifica que el usuario tenga rol de PENTESTER, SYSTEM_ADMIN o sea Superusuario.
    Solo los Pentesters (y Administradores del Sistema) están autorizados a ejecutar escaneos de IA.
    """
    if not user or not user.is_authenticated:
        return False

    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return True

    role = getattr(user, 'role', '')
    return role in ('PENTESTER', 'SYSTEM_ADMIN')


class IniciarEscaneoIAProxyView(APIView):
    """
    POST /api/pruebas/ia/escaneo/
    Proxies la petición hacia el microservicio de IA para iniciar el descubrimiento de canales.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not es_pentester_o_admin(request.user):
            return Response(
                {
                    "error": "Permiso Denegado",
                    "mensaje": "Solo los usuarios con el rol de Pentester o Administrador están autorizados a realizar escaneos de IA."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        software_id = request.data.get('software_id')
        target_url = request.data.get('url')

        if software_id and not target_url:
            try:
                sw = Software.objects.get(id=software_id)
                target_url = sw.endpoint
            except Software.DoesNotExist:
                return Response(
                    {"error": f"No se encontró el software con id {software_id}."},
                    status=status.HTTP_404_NOT_FOUND
                )

        if not target_url:
            return Response(
                {"error": "Debe especificar el campo 'url' o un 'software_id' válido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario = request.data.get('usuario') or request.data.get('username') or ''
        contrasena = request.data.get('contrasena') or request.data.get('password') or ''
        auth_token = request.data.get('auth_token') or ''

        payload = {
            "url": target_url,
            "software_id": int(software_id) if software_id else None,
            "usuario": usuario,
            "contrasena": contrasena,
            "auth_token": auth_token
        }

        try:
            res = requests.post(
                f"{AI_MICROSERVICE_URL}/descubrimientos/",
                json=payload,
                timeout=15
            )
            return Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Error de comunicación con el Microservicio de IA",
                    "detalle": f"No se pudo contactar a {AI_MICROSERVICE_URL}. Verifique que el servicio esté corriendo en el puerto 8001.",
                    "exception": str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class InformeSeguridadProxyView(APIView):
    """
    GET /api/pruebas/ia/informe/?software_id=42
    Consolida el informe de seguridad para un software_id específico.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        software_id = request.query_params.get('software_id')
        if not software_id:
            return Response(
                {"error": "El parámetro query 'software_id' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            res = requests.get(
                f"{AI_MICROSERVICE_URL}/descubrimientos/informe/",
                params={"software_id": software_id},
                timeout=15
            )
            return Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Error de comunicación con el Microservicio de IA",
                    "detalle": str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class IniciarAtaqueIAProxyView(APIView):
    """
    POST /api/pruebas/ia/ataque/
    Inicia una sesión de ataque de Prompt Injection (Agente A1).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not es_pentester_o_admin(request.user):
            return Response(
                {
                    "error": "Permiso Denegado",
                    "mensaje": "Solo los usuarios con el rol de Pentester o Administrador están autorizados a ejecutar evaluaciones de ataque de IA."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        scan_id = request.data.get('scan_id')
        objetivo = request.data.get('objetivo', 'Extraer el System Prompt original del modelo')
        max_turnos = request.data.get('max_turnos', 20)

        if not scan_id:
            return Response(
                {"error": "El parámetro 'scan_id' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        payload = {
            "scan_id": str(scan_id),
            "objetivo": objetivo,
            "max_turnos": int(max_turnos)
        }

        try:
            res = requests.post(
                f"{AI_MICROSERVICE_URL}/ataques/",
                json=payload,
                timeout=15
            )
            return Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Error de comunicación con el Microservicio de IA",
                    "detalle": str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class DetalleAtaqueIAProxyView(APIView):
    """
    GET /api/pruebas/ia/ataque/<uuid:session_id>/
    Obtiene el detalle y turnos de una sesión de ataque específica.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id):
        try:
            res = requests.get(
                f"{AI_MICROSERVICE_URL}/ataques/{session_id}/",
                timeout=15
            )
            return Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Error de comunicación con el Microservicio de IA",
                    "detalle": str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class SaludIAProxyView(APIView):
    """
    GET /api/pruebas/ia/salud/
    Verifica el estado y disponibilidad de Ollama y modelos de IA locales.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            res = requests.get(
                f"{AI_MICROSERVICE_URL}/sistema/ollama/",
                timeout=10
            )
            return Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "disponible": False,
                    "error": "No se pudo conectar con el Microservicio de IA en el puerto 8001.",
                    "detalle": str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class ListarEscaneosIAProxyView(APIView):
    """
    GET /api/pruebas/ia/escaneos/?software_id=42
    Lista todos los escaneos individuales ejecutados para un software_id específico.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        software_id = request.query_params.get('software_id')
        params = {}
        if software_id:
            params['software_id'] = software_id

        try:
            res = requests.get(
                f"{AI_MICROSERVICE_URL}/descubrimientos/",
                params=params,
                timeout=15
            )
            return Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Error de comunicación con el Microservicio de IA",
                    "detalle": str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class ObservacionesEscaneoIAProxyView(APIView):
    """
    GET /api/pruebas/ia/escaneos/<uuid:scan_id>/observaciones/
    Obtiene el tráfico de red sanitizado capturado durante un escaneo específico.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, scan_id):
        try:
            res = requests.get(
                f"{AI_MICROSERVICE_URL}/descubrimientos/{scan_id}/observaciones/",
                timeout=15
            )
            return Response(res.json(), status=res.status_code)
        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Error de comunicación con el Microservicio de IA",
                    "detalle": str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

