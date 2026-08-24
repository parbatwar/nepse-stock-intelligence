from django.core.management.base import BaseCommand

from analysis.correlation import build_all_correlations


class Command(BaseCommand):
    help = "Calculate news and market correlations"

    def handle(self, *args, **options):
        results = build_all_correlations()

        for result in results:
            self.stdout.write(
                self.style.SUCCESS(
                    f"{result['company']}: "
                    f"news-volume="
                    f"{result['news_volume_corr']}, "
                    f"sentiment-price="
                    f"{result['sentiment_price_corr']}"
                )
            )
