from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from accounts.permissions import IsAdminRole
from crawler.models import CrawlRun
from crawler.serializers import CrawlRunSerializer
from crawler.tasks import run_news_pipeline


class CrawlRunListCreateView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        runs = CrawlRun.objects.order_by("-started_at")[:50]

        serializer = CrawlRunSerializer(
            runs,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        task = run_news_pipeline.delay()

        return Response(
            {
                "message": "News crawl queued.",
                "task_id": task.id,
            },
            status=202,
        )


class CrawlRunDetailView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, run_id):
        crawl_run = get_object_or_404(
            CrawlRun,
            id=run_id,
        )

        serializer = CrawlRunSerializer(crawl_run)

        return Response(serializer.data)
