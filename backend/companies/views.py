from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from .models import Company
from .serializers import CompanySerializer


class CompanyListView(ListAPIView):
    queryset = Company.objects.filter(is_active=True).order_by("symbol")
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]
