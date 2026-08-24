from django.urls import path

from news.views import NewsListView, RecategorizeNewsView

urlpatterns = [
    path("", NewsListView.as_view(), name="news-list"),
    path(
        "<int:article_id>/recategorize/",
        RecategorizeNewsView.as_view(),
        name="news-recategorize",
    ),
]
