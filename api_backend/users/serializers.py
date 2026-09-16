from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Role

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializador para consultar los datos del usuario."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'role_display',
            'is_enabled',
            'accepted_terms',
            'terms_accepted_at',
            'created_by',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'terms_accepted_at')


class RegisterSerializer(serializers.ModelSerializer):
    """Serializador para registro público de usuarios PENTESTER con Términos y Condiciones."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=6,
        error_messages={'min_length': 'La contraseña debe tener al menos 6 caracteres.'}
    )
    email = serializers.EmailField(required=True)
    accepted_terms = serializers.BooleanField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'accepted_terms')

    def validate_accepted_terms(self, value):
        if not value:
            raise serializers.ValidationError("Debe aceptar los Términos y Condiciones para registrarse.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario registrado con este correo electrónico.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=Role.PENTESTER,
            is_enabled=False,  # Pendiente de activación por el System Admin
            accepted_terms=True,
            terms_accepted_at=timezone.now()
        )
        return user


class CreateAuditorSerializer(serializers.ModelSerializer):
    """Serializador para que un Pentester cree usuarios de tipo Auditor."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=6,
        error_messages={'min_length': 'La contraseña debe tener al menos 6 caracteres.'}
    )

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario registrado con este correo electrónico.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=Role.AUDITOR,
            is_enabled=True,  # Los auditores creados por el Pentester nacen habilitados
            created_by=request.user if request else None
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializador de Login con validación de activación de cuenta."""
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        if username_or_email and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                attrs[self.username_field] = user_obj.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)

        # Verificar si la cuenta está habilitada
        if not self.user.is_enabled:
            raise serializers.ValidationError(
                "Su cuenta de Pentester se encuentra pendiente de activación por el Administrador del Sistema."
            )

        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'role_display': self.user.get_role_display(),
            'is_enabled': self.user.is_enabled,
            'accepted_terms': self.user.accepted_terms,
        }
        return data


class LogoutSerializer(serializers.Serializer):
    """Serializador para cerrar sesión invalidando el refresh token."""
    refresh = serializers.CharField(required=True)

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            refreshToken = RefreshToken(self.token)
            refreshToken.blacklist()
        except TokenError:
            raise serializers.ValidationError({'refresh': 'El token de refresco es inválido o ya ha expirado.'})
