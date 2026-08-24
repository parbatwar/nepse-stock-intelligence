from django.core.management.base import BaseCommand

from companies.models import Company
from market.services import import_company_prices


class Command(BaseCommand):
    help = "Import recent OHLCV data for tracked companies"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=30,
        )

    def handle(self, *args, **options):
        days = options["days"]

        companies = Company.objects.filter(is_active=True).order_by("symbol")

        for company in companies:
            try:
                result = import_company_prices(
                    company,
                    days=days,
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"{company.symbol}: "
                        f"{result['created']} created, "
                        f"{result['updated']} updated"
                    )
                )

            except Exception as exc:
                self.stderr.write(self.style.ERROR(f"{company.symbol}: {exc}"))
