from datetime import datetime
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from django.utils import timezone

from news.models import NewsArticle
from .base import BaseNewsCrawler


class MeroLaganiCrawler(BaseNewsCrawler):
    source_name = "MeroLagani"
    listing_url = "https://eng.merolagani.com/NewsList.aspx"

    def crawl(self):
        response = self.get(self.listing_url)

        soup = BeautifulSoup(
            response.text,
            "lxml",
        )

        created_count = 0

        cards = soup.select("div.media-news")

        for card in cards[:20]:
            link = card.select_one("h4.media-title a")

            if not link:
                continue

            href = link.get("href")

            if not href:
                continue

            url = urljoin(
                self.listing_url,
                href,
            )

            headline = link.get_text(
                " ",
                strip=True,
            )

            if not headline:
                continue

            if NewsArticle.objects.filter(url=url).exists():
                continue

            published_at = None

            date_element = card.select_one("span.media-label")

            if date_element:
                date_text = date_element.get_text(
                    " ",
                    strip=True,
                )

                try:
                    dt = datetime.strptime(
                        date_text,
                        "%b %d, %Y %I:%M %p",
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
                    article_soup.select_one(".news-detail")
                    or article_soup.select_one(".news-content")
                    or article_soup.select_one("[id*='divNews']")
                    or article_soup.select_one("article")
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
                print(f"MeroLagani failed " f"{url}: {exc}")

        return {
            "source": self.source_name,
            "created": created_count,
        }
