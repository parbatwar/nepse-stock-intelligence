from rest_framework import serializers

from .models import (
    BehaviorAnalysis,
    NewsMarketCorrelation,
)


class BehaviorAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehaviorAnalysis
        fields = [
            "date",
            "vwap",
            "close_price",
            "pressure_label",
            "pressure_score",
            "volume_ratio",
            "volume_zscore",
            "volume_anomaly",
        ]


class NewsMarketCorrelationSerializer(serializers.ModelSerializer):
    company = serializers.CharField(
        source="company.symbol",
        read_only=True,
    )

    class Meta:
        model = NewsMarketCorrelation
        fields = [
            "company",
            "period_start",
            "period_end",
            "news_count_correlation",
            "sentiment_price_correlation",
            "sentiment_volume_correlation",
            "sample_size",
            "created_at",
        ]
