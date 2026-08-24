from datetime import date

from django.core.management.base import BaseCommand

from market.floorsheet import import_floorsheet


class Command(BaseCommand):
    help = "Import representative NEPSE floorsheet transactions"

    def add_arguments(self, parser):
        parser.add_argument(
            "--date",
            type=str,
            required=False,
        )

    def handle(self, *args, **options):
        raw_date = options.get("date")

        trade_date = date.fromisoformat(raw_date) if raw_date else date.today()

        result = import_floorsheet(trade_date)

        self.stdout.write(
            self.style.SUCCESS(
                f"Rows found: {result['rows_found']}, "
                f"tracked transactions created: "
                f"{result['created']}"
            )
        )
