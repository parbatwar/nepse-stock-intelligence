from django.core.management.base import BaseCommand

from news.services.crawler import crawl_all_news


class Command(BaseCommand):
    help = "Crawl stock-market news"

    def handle(self, *args, **options):

        results = crawl_all_news()

        for result in results:

            if result["status"] == "success":
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{result['source']}: " f"{result['created']} articles created"
                    )
                )

            else:
                self.stderr.write(
                    self.style.ERROR(f"{result['source']}: " f"{result['error']}")
                )
