from rest_framework import serializers
from .models import CrawlRun


class CrawlRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrawlRun
        fields = [
            "id",
            "crawl_type",
            "status",
            "started_at",
            "finished_at",
            "articles_found",
            "records_created",
            "error_message",
        ]
