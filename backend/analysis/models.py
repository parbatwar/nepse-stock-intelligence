from django.db import models

from companies.models import Company


class BehaviorAnalysis(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="behavior_analysis",
    )

    date = models.DateField()

    vwap = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
    )

    close_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    pressure_label = models.CharField(
        max_length=50,
        blank=True,
    )

    pressure_score = models.FloatField(
        null=True,
        blank=True,
    )

    volume_ratio = models.FloatField(
        null=True,
        blank=True,
    )

    volume_zscore = models.FloatField(
        null=True,
        blank=True,
    )

    volume_anomaly = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["company", "date"],
                name="unique_company_behavior_date",
            )
        ]

    def __str__(self):
        return f"{self.company.symbol} - {self.date}"


class NewsMarketCorrelation(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="news_correlations",
    )

    period_start = models.DateField()
    period_end = models.DateField()

    news_count_correlation = models.FloatField(
        null=True,
        blank=True,
    )

    sentiment_price_correlation = models.FloatField(
        null=True,
        blank=True,
    )

    sentiment_volume_correlation = models.FloatField(
        null=True,
        blank=True,
    )

    sample_size = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company.symbol} correlation"
