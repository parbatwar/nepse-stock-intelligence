from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from config.views import health
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from accounts.views import (
    AdminUserListCreateView,
    AdminUserRoleView,
)
from companies.views import (
    AdminCompanyListCreateView,
    AdminCompanyDetailView,
)

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
    path(
        "api/admin/companies/",
        AdminCompanyListCreateView.as_view(),
        name="admin-company-list-create",
    ),
    path(
        "api/admin/companies/<int:pk>/",
        AdminCompanyDetailView.as_view(),
        name="admin-company-detail",
    ),
    path("api/", include("market.urls")),
    path("api/", include("analysis.urls")),
    path("api/news/", include("news.urls")),
    path("api/admin/", include("crawler.urls")),
    path("api/auth/", include("accounts.urls")),
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/admin/users/",
        AdminUserListCreateView.as_view(),
        name="admin-users",
    ),
    path(
        "api/admin/users/<int:user_id>/role/",
        AdminUserRoleView.as_view(),
        name="admin-user-role",
    ),
]
