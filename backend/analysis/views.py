from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from companies.models import Company
from .models import BehaviorAnalysis
from .serializers import BehaviorAnalysisSerializer


class CompanyBehaviorSummaryView(ListAPIView):
    serializer_class = BehaviorAnalysisSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        return BehaviorAnalysis.objects.filter(company=company).order_by("date")
