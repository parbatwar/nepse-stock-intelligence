from celery import shared_task
from django.utils import timezone

from crawler.models import CrawlRun
from news.services.crawler import crawl_all_news
from news.services.categorizer import categorize_uncategorized_articles
from news.services.sentiment import analyze_all_articles

from companies.models import Company
from market.services import import_company_prices
from analysis.services import analyze_all_companies
from analysis.correlation import build_all_correlations


@shared_task
def run_news_pipeline():
    crawl_run = CrawlRun.objects.create(
        crawl_type="news",
        status=CrawlRun.Status.RUNNING,
    )

    try:
        results = crawl_all_news()

        created_count = 0
        errors = []

        for result in results:
            if result.get("status") == "success":
                created_count += result.get("created", 0)
            else:
                errors.append(f"{result.get('source')}: " f"{result.get('error')}")

        categorization = categorize_uncategorized_articles()

        analyze_all_articles()

        crawl_run.articles_found = created_count
        crawl_run.records_created = categorization["tags_created"]

        crawl_run.finished_at = timezone.now()

        if errors:
            crawl_run.status = CrawlRun.Status.PARTIAL_SUCCESS
            crawl_run.error_message = "\n".join(errors)
        else:
            crawl_run.status = CrawlRun.Status.SUCCESS

        crawl_run.save()

        return {
            "crawl_run_id": crawl_run.id,
            "articles_created": created_count,
            "tags_created": categorization["tags_created"],
        }

    except Exception as exc:
        crawl_run.status = CrawlRun.Status.FAILED
        crawl_run.finished_at = timezone.now()
        crawl_run.error_message = str(exc)
        crawl_run.save()

        raise


@shared_task
def refresh_market_pipeline():
    results = []

    for company in Company.objects.filter(is_active=True):
        result = import_company_prices(
            company,
            days=35,
        )

        results.append(result)

    analyze_all_companies()
    build_all_correlations()

    return results
