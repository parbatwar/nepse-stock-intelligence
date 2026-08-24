from django.core.management.base import BaseCommand

from news.services.categorizer import (
    categorize_uncategorized_articles,
)


class Command(BaseCommand):
    help = "Automatically categorize news by company"

    def handle(self, *args, **options):
        result = categorize_uncategorized_articles()

        self.stdout.write(
            self.style.SUCCESS(
                f"Processed {result['processed']} articles, "
                f"generated {result['tags_created']} company tags"
            )
        )
