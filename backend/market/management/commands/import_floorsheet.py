from datetime import datetime

from django.core.management.base import BaseCommand

from market.floorsheet import import_floorsheet


class Command(BaseCommand):
    help = "Import historical MeroLagani floorsheet"

    def add_arguments(self, parser):
        parser.add_argument(
            "--date",
            required=True,
            help="Trading date in YYYY-MM-DD format",
        )

    def handle(self, *args, **options):
        trade_date = datetime.strptime(
            options["date"],
            "%Y-%m-%d",
        ).date()

        result = import_floorsheet(trade_date)

        self.stdout.write(self.style.SUCCESS(str(result)))
