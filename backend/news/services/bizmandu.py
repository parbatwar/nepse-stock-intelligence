from datetime import datetime

from bs4 import BeautifulSoup
from django.utils import timezone

from news.models import NewsArticle
from .base import BaseNewsCrawler


class BizmanduCrawler(BaseNewsCrawler):
    source_name = "Bizmandu"
    listing_url = "https://bizmandu.com/content/category/market.html"

    def crawl(self):
        response = self.get(self.listing_url)

        soup = BeautifulSoup(
            response.text,
            "lxml",
        )

        created_count = 0

        cards = soup.select("div.news-title")

        for card in cards[:20]:
            link = card.select_one("h1.title-lg a")

            if not link:
                continue

            url = link.get("href")

            headline = link.get_text(
                " ",
                strip=True,
            )

            if not url or not headline:
                continue

            if NewsArticle.objects.filter(url=url).exists():
                continue

            published_at = None

            try:
                # Example:
                # https://bizmandu.com/content/20260823182818.html

                filename = url.rstrip("/").split("/")[-1]

                timestamp = filename.replace(
                    ".html",
                    "",
                )

                if len(timestamp) == 14 and timestamp.isdigit():
                    dt = datetime.strptime(
                        timestamp,
                        "%Y%m%d%H%M%S",
                    )

                    published_at = timezone.make_aware(dt)

            except ValueError:
                published_at = None

            try:
                article_response = self.get(url)

                article_soup = BeautifulSoup(
                    article_response.text,
                    "lxml",
                )

                body_element = (
                    article_soup.select_one("article")
                    or article_soup.select_one(".content")
                    or article_soup.select_one(".detail-content")
                    or article_soup.select_one(".news-detail")
                )

                if body_element:
                    body = body_element.get_text(
                        "\n",
                        strip=True,
                    )

                else:
                    paragraphs = article_soup.find_all("p")

                    body = "\n".join(
                        paragraph.get_text(
                            " ",
                            strip=True,
                        )
                        for paragraph in paragraphs
                        if paragraph.get_text(
                            " ",
                            strip=True,
                        )
                    )

                NewsArticle.objects.create(
                    headline=headline,
                    body=body,
                    source=self.source_name,
                    url=url,
                    published_at=published_at,
                )

                created_count += 1

            except Exception as exc:
                print(f"Bizmandu failed " f"{url}: {exc}")

        return {
            "source": self.source_name,
            "created": created_count,
        }
