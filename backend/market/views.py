from datetime import date

from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from companies.models import Company
from .broker_analysis import get_broker_summary
from .models import DailyPrice, FloorsheetTransaction
from .serializers import (
    DailyPriceSerializer,
    FloorsheetTransactionSerializer,
)
from accounts.permissions import IsViewerOrAbove


class CompanyPriceListView(ListAPIView):
    serializer_class = DailyPriceSerializer
    permission_classes = [IsViewerOrAbove]

    def get_queryset(self):
        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        raw_range = self.request.query_params.get(
            "range",
            "30d",
        )

        qs = DailyPrice.objects.filter(company=company)

        if raw_range.endswith("d"):
            try:
                days = int(raw_range[:-1])

                ids = list(qs.order_by("-date").values_list("id", flat=True)[:days])

                qs = qs.filter(id__in=ids)

            except ValueError:
                pass

        return qs.order_by("date")


class CompanyFloorsheetView(ListAPIView):
    serializer_class = FloorsheetTransactionSerializer
    permission_classes = [IsViewerOrAbove]

    def get_queryset(self):
        company = get_object_or_404(
            Company,
            pk=self.kwargs["company_id"],
        )

        qs = FloorsheetTransaction.objects.filter(company=company).order_by(
            "-trade_date", "transaction_no"
        )

        raw_date = self.request.query_params.get("date")

        if raw_date:
            qs = qs.filter(trade_date=raw_date)

        return qs


class BrokerSummaryView(APIView):
    permission_classes = [IsViewerOrAbove]

    def get(self, request, company_id):
        company = get_object_or_404(
            Company,
            pk=company_id,
        )

        raw_date = request.query_params.get("date")

        trade_date = None

        if raw_date:
            trade_date = date.fromisoformat(raw_date)

        summary = get_broker_summary(
            company,
            trade_date=trade_date,
        )

        return Response(
            {
                "company": company.symbol,
                "date": raw_date,
                "brokers": summary,
            }
        )
