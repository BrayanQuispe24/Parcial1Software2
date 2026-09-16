from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Role

User = get_user_model()


class UserAuthAndRoleTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Crear un usuario administrador
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@securitylab.io',
            password='Password123!',
            role=Role.ADMIN
        )

        # Crear un usuario estándar
        self.standard_user = User.objects.create_user(
            username='user_test',
            email='user@securitylab.io',
            password='Password123!',
            role=Role.USER
        )

    def test_register_new_user_with_role(self):
        payload = {
            "username": "auditor_new",
            "email": "auditor@securitylab.io",
            "password": "SecurePassword123!",
            "first_name": "Audit",
            "last_name": "User",
            "role": Role.AUDITOR
        }
        response = self.client.post('/api/auth/register/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['username'], 'auditor_new')
        self.assertEqual(response.data['user']['role'], Role.AUDITOR)

    def test_register_duplicate_username_fails(self):
        payload = {
            "username": "user_test",
            "email": "another@securitylab.io",
            "password": "Password123!"
        }
        response = self.client.post('/api/auth/register/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success_returns_jwt_and_user_metadata(self):
        payload = {
            "username": "user_test",
            "password": "Password123!"
        }
        response = self.client.post('/api/auth/login/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'user_test')
        self.assertEqual(response.data['user']['role'], Role.USER)

    def test_login_invalid_credentials_fails(self):
        payload = {
            "username": "user_test",
            "password": "WrongPassword!"
        }
        response = self.client.post('/api/auth/login/', payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_profile_access(self):
        login_res = self.client.post('/api/auth/login/', {
            "username": "user_test",
            "password": "Password123!"
        })
        access_token = login_res.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        profile_res = self.client.get('/api/auth/profile/')
        self.assertEqual(profile_res.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_res.data['username'], 'user_test')

    def test_logout_blacklists_refresh_token(self):
        login_res = self.client.post('/api/auth/login/', {
            "username": "user_test",
            "password": "Password123!"
        })
        access_token = login_res.data['access']
        refresh_token = login_res.data['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_res = self.client.post('/api/auth/logout/', {'refresh': refresh_token})
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

        refresh_res = self.client.post('/api/auth/token/refresh/', {'refresh': refresh_token})
        self.assertEqual(refresh_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_role_permission(self):
        login_user = self.client.post('/api/auth/login/', {
            "username": "user_test",
            "password": "Password123!"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_user.data['access']}")
        forbidden_res = self.client.get('/api/users/')
        self.assertEqual(forbidden_res.status_code, status.HTTP_403_FORBIDDEN)

        login_admin = self.client.post('/api/auth/login/', {
            "username": "admin_test",
            "password": "Password123!"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_admin.data['access']}")
        allowed_res = self.client.get('/api/users/')
        self.assertEqual(allowed_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(allowed_res.data['results']), 2)
