from django.core.management.base import BaseCommand

from analysis.models import BehaviorAnalysis
from companies.models import Company
from market.models import DailyPrice, FloorsheetTransaction
from news.models import NewsCompanyTag


class Command(BaseCommand):
    help = "Print behavioral findings for tracked companies"

    def handle(self, *args, **options):
        for company in Company.objects.filter(is_active=True):
            prices = DailyPrice.objects.filter(company=company).order_by("date")

            behavior = BehaviorAnalysis.objects.filter(company=company).order_by("date")

            tags = NewsCompanyTag.objects.filter(company=company)

            floorsheet = FloorsheetTransaction.objects.filter(company=company)

            first_price = prices.first()
            last_price = prices.last()

            change = None

            if first_price and last_price:
                change = (
                    (float(last_price.close) - float(first_price.close))
                    / float(first_price.close)
                    * 100
                )

            anomalies = behavior.filter(volume_anomaly=True).count()

            latest_behavior = behavior.last()

            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS(company.symbol))

            self.stdout.write(
                f"Price change %: "
                f"{round(change, 2) if change is not None else None}"
            )

            self.stdout.write(f"News tags: {tags.count()}")

            self.stdout.write(f"Volume anomalies: {anomalies}")

            self.stdout.write(f"Floorsheet tx: {floorsheet.count()}")

            self.stdout.write(
                "Latest pressure: "
                + (latest_behavior.pressure_label if latest_behavior else "None")
            )
