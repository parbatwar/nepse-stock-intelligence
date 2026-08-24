from django.shortcuts import get_object_or_404

from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from companies.models import Company
from .models import BehaviorAnalysis, NewsMarketCorrelation
from .serializers import (
    BehaviorAnalysisSerializer,
    NewsMarketCorrelationSerializer,
)


class CompanyBehaviorSummaryView(ListAPIView):
    serializer_class = BehaviorAnalysisSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        return BehaviorAnalysis.objects.filter(company=company).order_by("date")


class CompanyNewsCorrelationView(APIView):
    permission_classes = [AllowAny]

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
