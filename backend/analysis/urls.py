from django.urls import path

from analysis.views import (
    CompanyBehaviorSummaryView,
    CompanyNewsCorrelationView,
    BehaviorAnalysisExportView,
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
    path(
        "export/behavior/",
        BehaviorAnalysisExportView.as_view(),
        name="behavior-export",
    ),
]
