from django.urls import path

from .views import (
    CompanyBehaviorSummaryView,
    CompanyNewsCorrelationView,
)

urlpatterns = [
    path(
        "companies/<int:company_id>/behavior-summary/",
        CompanyBehaviorSummaryView.as_view(),
        name="company-behavior-summary",
    ),
    path(
        "companies/<int:company_id>/news-price-correlation/",
        CompanyNewsCorrelationView.as_view(),
        name="company-news-correlation",
    ),
]
