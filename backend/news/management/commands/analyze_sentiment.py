from django.core.management.base import BaseCommand

from news.services.sentiment import analyze_all_articles


class Command(BaseCommand):
    help = "Analyze sentiment for crawled news articles"

    def handle(self, *args, **options):
        processed = analyze_all_articles()

        self.stdout.write(
            self.style.SUCCESS(f"Processed sentiment for {processed} articles")
        )
