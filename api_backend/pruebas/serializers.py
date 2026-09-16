from rest_framework import serializers
from .models import Software

class SoftwareSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Software
        fields = [
            'id',
            'name',
            'endpoint',
            'protocol',
            'llm_provider',
            'system_prompt_sample',
            'status',
            'user',
            'user_username',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'user_username', 'created_at', 'updated_at']
