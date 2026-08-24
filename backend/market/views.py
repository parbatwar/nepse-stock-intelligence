from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from companies.models import Company
from .models import DailyPrice
from .serializers import DailyPriceSerializer


class CompanyPriceListView(ListAPIView):
    serializer_class = DailyPriceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        return DailyPrice.objects.filter(company=company).order_by("date")
