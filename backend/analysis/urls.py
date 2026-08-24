from django.urls import path
from .views import CompanyBehaviorSummaryView

urlpatterns = [
    path(
        "companies/<int:company_id>/behavior-summary/",
        CompanyBehaviorSummaryView.as_view(),
        name="company-behavior-summary",
    ),
]
