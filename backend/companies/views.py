from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from accounts.permissions import IsViewerOrAbove

from .models import Company
from .serializers import CompanySerializer


class CompanyListView(ListAPIView):
    queryset = Company.objects.filter(is_active=True).order_by("symbol")
    serializer_class = CompanySerializer
    permission_classes = [IsViewerOrAbove]
