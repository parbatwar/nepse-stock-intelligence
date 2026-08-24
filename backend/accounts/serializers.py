from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_active",
            "role",
        ]

    def get_role(self, obj):
        if obj.is_superuser:
            return "Admin"

        group = obj.groups.first()

        return group.name if group else "Viewer"


class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=6,
    )
    role = serializers.ChoiceField(
        choices=[
            "Admin",
            "Analyst",
            "Viewer",
        ]
    )
