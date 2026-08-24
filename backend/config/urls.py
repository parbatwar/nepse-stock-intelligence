from django.contrib import admin
from django.urls import include, path

from config.views import health

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/companies/", include("companies.urls")),
    path("api/", include("market.urls")),
    path("api/", include("analysis.urls")),
]
