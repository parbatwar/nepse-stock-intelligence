from django.urls import path

from .views import (
    AdminUserListCreateView,
    AdminUserRoleView,
    CurrentUserView,
)

urlpatterns = [
    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),
    path(
        "users/",
        AdminUserListCreateView.as_view(),
        name="admin-users",
    ),
    path(
        "users/<int:user_id>/role/",
        AdminUserRoleView.as_view(),
        name="admin-user-role",
    ),
]
