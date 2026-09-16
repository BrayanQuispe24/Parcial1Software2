from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings

from .models import Role
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CreateAuditorSerializer,
    CustomTokenObtainPairSerializer,
    LogoutSerializer
)
from .permissions import IsSystemAdmin, IsPentester

User = get_user_model()

SYSTEM_ADMIN_EMAIL = "brayansabinoquispearce2021@gmail.com"


def render_html_admin_notification(user):
    """Genera una plantilla HTML profesional con CSS para notificar al System Admin."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); }}
        .header {{ background: #0f172a; color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #38bdf8; }}
        .brand-icon {{ display: inline-block; background: #1e40af; color: #fff; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-size: 14px; margin-right: 8px; }}
        .body {{ padding: 28px; line-height: 1.6; font-size: 14px; color: #334155; }}
        .info-card {{ background: #f1f5f9; border-left: 4px solid #38bdf8; padding: 16px; border-radius: 6px; margin: 20px 0; }}
        .info-row {{ margin-bottom: 8px; font-size: 13px; }}
        .badge {{ display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }}
        .footer {{ background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2><span class="brand-icon">AI</span> GenAI Security Lab</h2>
          <p style="margin:4px 0 0 0; font-size: 13px; color: #94a3b8;">Notificación de Seguridad del Sistema</p>
        </div>
        <div class="body">
          <h3 style="color: #0f172a; margin-top: 0;">⚠️ Nueva Solicitud de Registro de Pentester</h3>
          <p>Estimado <strong>Administrador del Sistema</strong>,</p>
          <p>Se ha registrado un nuevo usuario con rol de <strong>Pentester</strong> que requiere tu revisión y aprobación para ser habilitado:</p>
          
          <div class="info-card">
            <div class="info-row"><strong>Nombre de Usuario:</strong> {user.username}</div>
            <div class="info-row"><strong>Correo Electrónico:</strong> {user.email}</div>
            <div class="info-row"><strong>Nombre Completo:</strong> {user.first_name or ''} {user.last_name or ''}</div>
            <div class="info-row"><strong>Estado:</strong> <span class="badge">PENDIENTE DE ACTIVACIÓN</span></div>
          </div>
          
          <p>Por favor, ingresa al panel de administración para habilitar la cuenta si la solicitud es legítima.</p>
        </div>
        <div class="footer">
          © 2026 GenAI Security Lab Enterprise • Control de Accesos
        </div>
      </div>
    </body>
    </html>
    """


def render_html_activation_email(user):
    """Genera una plantilla HTML con CSS estilizado para la confirmación de cuenta y Términos y Condiciones."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }}
        .container {{ max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1); }}
        .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%); color: #ffffff; padding: 28px; text-align: center; border-bottom: 4px solid #10b981; }}
        .brand-icon {{ display: inline-block; background: #2563eb; color: #fff; font-weight: 800; padding: 6px 12px; border-radius: 6px; font-size: 16px; }}
        .body {{ padding: 32px; line-height: 1.6; font-size: 14px; color: #334155; }}
        .status-box {{ background: #ecfdf5; border: 1px solid #a7f3d0; border-left: 5px solid #10b981; color: #065f46; padding: 16px; border-radius: 8px; margin: 20px 0; }}
        .terms-box {{ background: #0f172a; color: #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 24px; border: 1px solid #334155; font-size: 13px; }}
        .terms-header {{ color: #38bdf8; font-weight: 700; font-size: 14px; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 14px; text-transform: uppercase; tracking: 0.05em; }}
        .terms-item {{ margin-bottom: 12px; line-height: 1.5; }}
        .terms-item strong {{ color: #ffffff; }}
        .footer {{ background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2><span class="brand-icon">AI</span> GenAI Security Lab</h2>
          <p style="margin:6px 0 0 0; font-size: 14px; color: #93c5fd;">Plataforma de Evaluación de Seguridad en IA</p>
        </div>
        <div class="body">
          <h2 style="color: #0f172a; margin-top: 0;">🎉 ¡Tu cuenta ha sido HABILITADA!</h2>
          <p>Hola <strong>{user.first_name or user.username}</strong>,</p>
          
          <div class="status-box">
            <strong>✓ Cuenta Activada Exitosamente:</strong> Tu usuario de <strong>Pentester</strong> ha sido revisado y habilitado por el Administrador del Sistema. Ya puedes iniciar sesión con tus credenciales (<code>{user.email}</code>).
          </div>

          <div class="terms-box">
            <div class="terms-header">📜 Términos y Condiciones del Sistema Aceptados</div>
            
            <div class="terms-item">
              <strong>1. Uso Autorizado y Evaluación Ofensiva:</strong><br>
              La plataforma está diseñada exclusivamente para evaluaciones de seguridad autorizadas en chatbots, LLMs y sistemas RAG. Debe contar con autorización explícita para cada objetivo probado.
            </div>

            <div class="terms-item">
              <strong>2. Responsabilidad de Payloads y Evidencias:</strong><br>
              El Pentester es responsable del uso de los vectores de ataque. Todas las evidencias registradas cuentan con firmas criptográficas Hash SHA-256 de trazabilidad.
            </div>

            <div class="terms-item">
              <strong>3. Confidencialidad y Manejo de Datos:</strong><br>
              Queda estrictamente prohibida la divulgación no autorizada de tokens JWT, credenciales o prompts de sistema obtenidos durante las pruebas.
            </div>

            <div class="terms-item">
              <strong>4. Creación Delegada de Auditores:</strong><br>
              Como Pentester habilitado, tienes permiso para registrar y asignar cuentas de tipo <strong>Auditor</strong> bajo tu gestión.
            </div>
          </div>
        </div>
        <div class="footer">
          © 2026 GenAI Security Lab Enterprise • Seguridad en Inteligencia Artificial
        </div>
      </div>
    </body>
    </html>
    """


class RegisterView(generics.CreateAPIView):
    """Endpoint público para registrar nuevos Pentesters (creados en estado PENDIENTE DE ACTIVACIÓN)."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Enviar correo al Administrador del Sistema con formato plano + HTML estilizado
        subject = f"[GenAI Security Lab] Nueva cuenta de Pentester registrada: {user.username}"
        plain_message = f"Nueva cuenta de Pentester registrada (Pendiente de activación): {user.username} ({user.email})."
        html_message = render_html_admin_notification(user)

        try:
            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@genai-security-lab.com'),
                recipient_list=[SYSTEM_ADMIN_EMAIL],
                fail_silently=True
            )
        except Exception as e:
            print(f"Notificación por correo al System Admin impresa en consola: {e}")

        user_data = UserSerializer(user).data
        return Response({
            "message": "Cuenta de Pentester registrada en estado PENDIENTE DE ACTIVACIÓN. Se ha enviado un correo al Administrador del Sistema para su aprobación.",
            "user": user_data
        }, status=status.HTTP_201_CREATED)


class EnableUserView(APIView):
    """Endpoint exclusivo para el Administrador del Sistema para Habilitar/Activar cuentas de Pentester."""
    permission_classes = [IsSystemAdmin]

    def post(self, request, pk, *args, **kwargs):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        target_user.is_enabled = True
        target_user.save()

        # Enviar correo electrónico HTML al Pentester notificando la activación y los Términos y Condiciones
        subject = "[GenAI Security Lab] ¡Tu cuenta de Pentester ha sido HABILITADA!"
        plain_message = f"Hola {target_user.username}, tu cuenta de Pentester ha sido habilitada por el Administrador del Sistema."
        html_message = render_html_activation_email(target_user)

        try:
            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@genai-security-lab.com'),
                recipient_list=[target_user.email],
                fail_silently=True
            )
        except Exception as e:
            print(f"Correo de activación enviado a {target_user.email}: {e}")

        return Response({
            "message": f"La cuenta del Pentester '{target_user.username}' ha sido habilitada exitosamente y se envió el correo con los términos y condiciones.",
            "user": UserSerializer(target_user).data
        }, status=status.HTTP_200_OK)


class CreateAuditorView(generics.CreateAPIView):
    """Endpoint para que un Pentester autenticado registre sus usuarios tipo Auditor."""
    permission_classes = [IsPentester]
    serializer_class = CreateAuditorSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        auditor_user = serializer.save()
        return Response({
            "message": "Usuario Auditor creado exitosamente por el Pentester.",
            "user": UserSerializer(auditor_user).data
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Endpoint público de Login (Retorna tokens JWT + información del usuario)."""
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(generics.GenericAPIView):
    """Endpoint autenticado para cerrar sesión enviando a lista negra el refresh token."""
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "message": "Sesión cerrada correctamente. El token ha sido invalidado."
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Endpoint autenticado para ver y actualizar la información del perfil propio."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """Endpoint para listar usuarios según el rol del usuario que consulta."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.SYSTEM_ADMIN or user.is_superuser:
            return User.objects.all().order_by('-created_at')
        elif user.role == Role.PENTESTER:
            return User.objects.filter(created_by=user).order_by('-created_at')
        return User.objects.filter(id=user.id)


class UserStatsView(APIView):
    """Endpoint exclusivo para el Administrador del Sistema con métricas cuantitativas de usuarios."""
    permission_classes = [IsSystemAdmin]

    def get(self, request, *args, **kwargs):
        total_users = User.objects.count()
        pentesters_enabled = User.objects.filter(role=Role.PENTESTER, is_enabled=True).count()
        pentesters_pending = User.objects.filter(role=Role.PENTESTER, is_enabled=False).count()
        total_auditors = User.objects.filter(role=Role.AUDITOR).count()

        recent_pentesters = User.objects.filter(role=Role.PENTESTER).order_by('-created_at')[:5]

        return Response({
            "total_users": total_users,
            "pentesters_enabled": pentesters_enabled,
            "pentesters_pending": pentesters_pending,
            "total_auditors": total_auditors,
            "recent_pentesters": UserSerializer(recent_pentesters, many=True).data
        }, status=status.HTTP_200_OK)
