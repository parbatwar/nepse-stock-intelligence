from django.urls import path

from .views import CompanyPriceListView

urlpatterns = [
    path(
        "companies/<int:company_id>/prices/",
        CompanyPriceListView.as_view(),
        name="company-prices",
    ),
]
