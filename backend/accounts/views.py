from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from accounts.serializers import (
    UserCreateSerializer,
    UserSerializer,
)

User = get_user_model()


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)

        return Response(serializer.data)


class AdminUserListCreateView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        users = User.objects.prefetch_related("groups").order_by("username")

        serializer = UserSerializer(
            users,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
        )

        role = data["role"]

        group = Group.objects.get(name=role)

        user.groups.add(group)

        if role == "Admin":
            user.is_staff = True
            user.save(update_fields=["is_staff"])

        return Response(
            UserSerializer(user).data,
            status=201,
        )


class AdminUserRoleView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, user_id):
        user = User.objects.get(id=user_id)

        role = request.data.get("role")

        if role not in [
            "Admin",
            "Analyst",
            "Viewer",
        ]:
            return Response(
                {"detail": "Invalid role."},
                status=400,
            )

        user.groups.clear()

        group = Group.objects.get(name=role)

        user.groups.add(group)

        user.is_staff = role == "Admin"
        user.save(update_fields=["is_staff"])

        return Response(UserSerializer(user).data)
