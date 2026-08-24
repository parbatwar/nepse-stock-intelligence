from django.urls import path

from .views import (
    CrawlRunDetailView,
    CrawlRunListCreateView,
)

urlpatterns = [
    path(
        "crawl-runs/",
        CrawlRunListCreateView.as_view(),
        name="crawl-runs",
    ),
    path(
        "crawl-runs/<int:run_id>/",
        CrawlRunDetailView.as_view(),
        name="crawl-run-detail",
    ),
]
