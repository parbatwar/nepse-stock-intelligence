from django.conf import settings
from django.db import models

from companies.models import Company


class NewsArticle(models.Model):
    headline = models.CharField(max_length=500)
    body = models.TextField(blank=True)

    source = models.CharField(max_length=100)
    url = models.URLField(max_length=1000, unique=True)

    published_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    crawled_at = models.DateTimeField(auto_now_add=True)

    sentiment_label = models.CharField(
        max_length=20,
        blank=True,
    )
    sentiment_score = models.FloatField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.headline[:80]


class NewsCompanyTag(models.Model):
    article = models.ForeignKey(
        NewsArticle,
        on_delete=models.CASCADE,
        related_name="company_tags",
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="news_tags",
    )

    confidence = models.FloatField()

    method = models.CharField(
        max_length=50,
        default="rule_based",
    )

    is_manual = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["article", "company"],
                name="unique_article_company_tag",
            )
        ]

    def __str__(self):
        return f"{self.article_id} -> {self.company.symbol}"


class CategorizationCorrection(models.Model):
    article = models.ForeignKey(
        NewsArticle,
        on_delete=models.CASCADE,
        related_name="corrections",
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
    )

    corrected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )

    old_value = models.BooleanField()
    new_value = models.BooleanField()

    reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Correction #{self.id}"
