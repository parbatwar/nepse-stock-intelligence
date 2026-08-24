import csv
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsViewerOrAbove
from accounts.permissions import IsAnalystOrAdmin
from companies.models import Company
from .models import BehaviorAnalysis, NewsMarketCorrelation
from .serializers import (
    BehaviorAnalysisSerializer,
    NewsMarketCorrelationSerializer,
)


class CompanyBehaviorSummaryView(ListAPIView):
    serializer_class = BehaviorAnalysisSerializer
    permission_classes = [IsViewerOrAbove]

    def get_queryset(self):
        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        return BehaviorAnalysis.objects.filter(company=company).order_by("date")


class CompanyNewsCorrelationView(APIView):
    permission_classes = [IsViewerOrAbove]

    def get(self, request, company_id):
        company = get_object_or_404(
            Company,
            pk=company_id,
        )

        correlation = (
            NewsMarketCorrelation.objects.filter(company=company)
            .order_by("-created_at")
            .first()
        )

        if not correlation:
            return Response(
                {"detail": ("Correlation analysis has not " "been generated yet.")},
                status=404,
            )

        serializer = NewsMarketCorrelationSerializer(correlation)

        return Response(serializer.data)


class BehaviorAnalysisExportView(APIView):
    permission_classes = [IsAnalystOrAdmin]

    def get(self, request):
        response = HttpResponse(content_type="text/csv")

        response["Content-Disposition"] = 'attachment; filename="behavior_analysis.csv"'

        writer = csv.writer(response)

        writer.writerow(
            [
                "Company",
                "Date",
                "Close Price",
                "VWAP",
                "Pressure",
                "Pressure Score",
                "Volume Ratio",
                "Volume Z-Score",
                "Volume Anomaly",
            ]
        )

        rows = BehaviorAnalysis.objects.select_related("company").order_by(
            "company__symbol", "date"
        )

        for row in rows:
            writer.writerow(
                [
                    row.company.symbol,
                    row.date,
                    row.close_price,
                    row.vwap,
                    row.pressure_label,
                    row.pressure_score,
                    row.volume_ratio,
                    row.volume_zscore,
                    row.volume_anomaly,
                ]
            )

        return response
