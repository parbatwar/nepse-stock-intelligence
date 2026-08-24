from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAnalystOrAdmin, IsViewerOrAbove
from companies.models import Company
from news.models import CategorizationCorrection, NewsArticle, NewsCompanyTag
from news.serializers import NewsArticleSerializer, RecategorizeSerializer


class NewsListView(ListAPIView):
    serializer_class = NewsArticleSerializer
    permission_classes = [IsViewerOrAbove]

    def get_queryset(self):
        queryset = NewsArticle.objects.prefetch_related(
            "company_tags__company"
        ).order_by("-published_at", "-crawled_at")

        company_id = self.request.query_params.get("company_id")

        if company_id:
            queryset = queryset.filter(company_tags__company_id=company_id)

        return queryset.distinct()


class RecategorizeNewsView(APIView):
    permission_classes = [IsAnalystOrAdmin]

    def post(self, request, article_id):
        article = get_object_or_404(NewsArticle, id=article_id)

        serializer = RecategorizeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        company = Company.objects.get(id=serializer.validated_data["company_id"])

        should_be_tagged = serializer.validated_data["should_be_tagged"]
        reason = serializer.validated_data.get("reason", "")

        existing_tag = NewsCompanyTag.objects.filter(
            article=article,
            company=company,
        ).first()

        old_value = existing_tag is not None

        if should_be_tagged:
            NewsCompanyTag.objects.update_or_create(
                article=article,
                company=company,
                defaults={
                    "confidence": 1.0,
                    "method": "manual_review",
                    "is_manual": True,
                },
            )
        else:
            if existing_tag:
                existing_tag.delete()

        CategorizationCorrection.objects.create(
            article=article,
            company=company,
            corrected_by=request.user,
            old_value=old_value,
            new_value=should_be_tagged,
            reason=reason,
        )

        return Response(
            {
                "article_id": article.id,
                "company": company.symbol,
                "old_value": old_value,
                "new_value": should_be_tagged,
                "corrected_by": request.user.username,
            }
        )
