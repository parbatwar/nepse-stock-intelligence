from rest_framework import serializers

from .models import DailyPrice, FloorsheetTransaction


class DailyPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyPrice
        fields = [
            "date",
            "open",
            "high",
            "low",
            "close",
            "volume",
            "turnover",
        ]


class FloorsheetTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FloorsheetTransaction
        fields = [
            "trade_date",
            "transaction_no",
            "buyer_broker",
            "seller_broker",
            "quantity",
            "rate",
            "amount",
        ]
