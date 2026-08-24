from django.db import models
from companies.models import Company


class DailyPrice(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="prices",
    )
    date = models.DateField()

    open = models.DecimalField(max_digits=14, decimal_places=2)
    high = models.DecimalField(max_digits=14, decimal_places=2)
    low = models.DecimalField(max_digits=14, decimal_places=2)
    close = models.DecimalField(max_digits=14, decimal_places=2)

    volume = models.BigIntegerField()
    turnover = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["company", "date"],
                name="unique_company_price_date",
            )
        ]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.company.symbol} - {self.date}"


class FloorsheetTransaction(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="floorsheet_transactions",
    )

    trade_date = models.DateField()
    transaction_no = models.CharField(
        max_length=100,
        blank=True,
    )

    buyer_broker = models.CharField(max_length=50)
    seller_broker = models.CharField(max_length=50)

    quantity = models.BigIntegerField()
    rate = models.DecimalField(max_digits=14, decimal_places=2)
    amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True,
    )

    class Meta:
        indexes = [
            models.Index(fields=["company", "trade_date"]),
        ]

    def __str__(self):
        return f"{self.company.symbol} {self.trade_date}"
