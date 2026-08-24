from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "symbol",
            "name",
            "sector",
            "aliases",
            "is_active",
        ]
