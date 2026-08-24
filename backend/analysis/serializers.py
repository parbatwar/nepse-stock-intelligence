from rest_framework import serializers
from .models import BehaviorAnalysis


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
