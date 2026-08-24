from rest_framework.permissions import BasePermission


def get_user_role(user):
    if not user or not user.is_authenticated:
        return None

    if user.is_superuser:
        return "Admin"

    group = user.groups.first()

    if group:
        return group.name

    return "Viewer"


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == "Admin"


class IsAnalystOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) in [
            "Admin",
            "Analyst",
        ]


class IsViewerOrAbove(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) in [
            "Admin",
            "Analyst",
            "Viewer",
        ]


class ReadOnlyViewerOrAbove(BasePermission):
    def has_permission(self, request, view):
        if get_user_role(request.user) not in [
            "Admin",
            "Analyst",
            "Viewer",
        ]:
            return False

        return request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]
