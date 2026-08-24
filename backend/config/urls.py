from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from config.views import health

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path(
        "api/auth/login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path("api/companies/", include("companies.urls")),
    path("api/", include("market.urls")),
    path("api/", include("analysis.urls")),
    path("api/news/", include("news.urls")),
]
