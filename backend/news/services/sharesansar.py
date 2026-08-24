from bs4 import BeautifulSoup

from news.models import NewsArticle
from .base import BaseNewsCrawler

TARGET_ARTICLES = [
    "https://www.sharesansar.com/newsdetail/shivam-cements-profit-falls-172-as-sales-revenue-drops-2026-08-13",
    "https://www.sharesansar.com/newsdetail/promoter-shares-of-nic-asia-bank-limited-in-auction-from-today-2026-07-15",
]


class ShareSansarCrawler(BaseNewsCrawler):
    source_name = "ShareSansar"

    listing_url = "https://www.sharesansar.com/category/latest"

    def save_article(self, url, fallback_headline=""):
        if NewsArticle.objects.filter(url=url).exists():
            return False

        response = self.get(url)
        soup = BeautifulSoup(response.text, "lxml")

        headline_element = soup.select_one("h1")

        headline = (
            headline_element.get_text(" ", strip=True)
            if headline_element
            else fallback_headline
        )

        body_element = soup.select_one(".newsdetail-content")

        if not body_element:
            body_element = soup.select_one(".news-content")

        body = body_element.get_text("\n", strip=True) if body_element else ""

        if not headline:
            return False

        NewsArticle.objects.create(
            headline=headline,
            body=body,
            source=self.source_name,
            url=url,
        )

        return True

    def crawl_target_articles(self):
        created_count = 0

        for url in TARGET_ARTICLES:
            try:
                created = self.save_article(url)

                if created:
                    created_count += 1

            except Exception as exc:
                print(f"Failed targeted article {url}: {exc}")

        return created_count

    def crawl(self):
        response = self.get(self.listing_url)
        soup = BeautifulSoup(response.text, "lxml")

        created_count = 0

        articles = soup.select("div.featured-news-list")

        for item in articles[:20]:
            link = item.select_one("a")

            if not link:
                continue

            url = link.get("href")

            if not url:
                continue

            try:
                created = self.save_article(
                    url,
                    fallback_headline=link.get_text(
                        " ",
                        strip=True,
                    ),
                )

                if created:
                    created_count += 1

            except Exception as exc:
                print(f"Failed article {url}: {exc}")

        targeted_created = self.crawl_target_articles()

        return {
            "source": self.source_name,
            "created": created_count + targeted_created,
        }
