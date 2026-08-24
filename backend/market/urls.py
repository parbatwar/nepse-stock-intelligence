from django.urls import path

from .views import (
    BrokerSummaryView,
    CompanyFloorsheetView,
    CompanyPriceListView,
)

urlpatterns = [
    path(
        "companies/<int:company_id>/prices/",
        CompanyPriceListView.as_view(),
        name="company-prices",
    ),
    path(
        "companies/<int:company_id>/floorsheet/",
        CompanyFloorsheetView.as_view(),
        name="company-floorsheet",
    ),
    path(
        "companies/<int:company_id>/broker-summary/",
        BrokerSummaryView.as_view(),
        name="broker-summary",
    ),
]
