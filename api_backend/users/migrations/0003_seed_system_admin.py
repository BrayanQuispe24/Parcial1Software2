from django.db import migrations

def create_or_update_system_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    admin_email = "brayansabinoquispearce2021@gmail.com"
    
    user = User.objects.filter(email=admin_email).first() or User.objects.filter(username=admin_email).first()
    if not user:
        user = User(
            username=admin_email,
            email=admin_email,
        )
    
    user.username = admin_email
    user.email = admin_email
    user.first_name = "Administrador"
    user.last_name = "del Sistema"
    user.role = "SYSTEM_ADMIN"
    user.is_enabled = True
    user.is_active = True
    user.accepted_terms = True
    user.is_staff = True
    user.is_superuser = True
    user.set_password("123456789")
    user.save()

def reverse_system_admin(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_accepted_terms_user_created_by_user_is_enabled_and_more'),
    ]

    operations = [
        migrations.RunPython(create_or_update_system_admin, reverse_system_admin),
    ]
