from rest_framework import serializers

from companies.models import Company
from news.models import CategorizationCorrection, NewsArticle, NewsCompanyTag


class NewsCompanyTagSerializer(serializers.ModelSerializer):
    company_symbol = serializers.CharField(source="company.symbol", read_only=True)

    class Meta:
        model = NewsCompanyTag
        fields = [
            "id",
            "company",
            "company_symbol",
            "confidence",
            "method",
            "is_manual",
        ]


class NewsArticleSerializer(serializers.ModelSerializer):
    company_tags = NewsCompanyTagSerializer(many=True, read_only=True)

    class Meta:
        model = NewsArticle
        fields = [
            "id",
            "headline",
            "body",
            "source",
            "url",
            "published_at",
            "crawled_at",
            "sentiment_label",
            "sentiment_score",
            "company_tags",
        ]


class RecategorizeSerializer(serializers.Serializer):
    company_id = serializers.IntegerField()
    should_be_tagged = serializers.BooleanField()
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate_company_id(self, value):
        if not Company.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid company.")

        return value
