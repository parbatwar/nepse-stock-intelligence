from rest_framework import generics

from accounts.permissions import IsAdminRole, IsViewerOrAbove
from companies.models import Company
from companies.serializers import CompanySerializer


class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.filter(is_active=True).order_by("symbol")
    serializer_class = CompanySerializer
    permission_classes = [IsViewerOrAbove]


class AdminCompanyListCreateView(generics.ListCreateAPIView):
    queryset = Company.objects.all().order_by("symbol")
    serializer_class = CompanySerializer
    permission_classes = [IsAdminRole]


class AdminCompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminRole]
