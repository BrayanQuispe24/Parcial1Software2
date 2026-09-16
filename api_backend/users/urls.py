from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    LogoutView,
    UserProfileView,
    UserListView,
    UserStatsView,
    EnableUserView,
    CreateAuditorView
)

urlpatterns = [
    # Rutas de Autenticación (JWT)
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/profile/', UserProfileView.as_view(), name='auth_profile'),

    # Gestión de Usuarios y Estadísticas
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/stats/', UserStatsView.as_view(), name='user_stats'),
    path('users/<int:pk>/enable/', EnableUserView.as_view(), name='user_enable'),
    path('users/auditors/', CreateAuditorView.as_view(), name='auditor_create'),
]
