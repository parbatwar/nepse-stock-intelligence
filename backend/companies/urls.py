from django.urls import path

from companies.views import CompanyListView

urlpatterns = [
    path(
        "",
        CompanyListView.as_view(),
        name="company-list",
    ),
]
