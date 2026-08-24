from django.core.management.base import BaseCommand

from analysis.services import analyze_all_companies


class Command(BaseCommand):
    help = "Calculate behavior analysis for tracked companies"

    def handle(self, *args, **options):
        results = analyze_all_companies()

        for result in results:
            self.stdout.write(
                self.style.SUCCESS(
                    f"{result['company']}: " f"{result['records']} analysis rows"
                )
            )
