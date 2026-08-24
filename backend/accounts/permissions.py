from rest_framework.permissions import BasePermission


def user_has_role(user, role_name):
    return user.is_authenticated and (
        user.is_superuser or user.groups.filter(name=role_name).exists()
    )


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return user_has_role(request.user, "Admin")


class IsAnalystOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return user_has_role(request.user, "Admin") or user_has_role(
            request.user, "Analyst"
        )


class IsViewerOrAbove(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated
