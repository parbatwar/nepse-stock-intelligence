from .sharesansar import ShareSansarCrawler


def crawl_all_news():
    crawlers = [
        ShareSansarCrawler(),
    ]

    results = []

    for crawler in crawlers:
        try:
            result = crawler.crawl()

            results.append(
                {
                    **result,
                    "status": "success",
                }
            )

        except Exception as exc:
            results.append(
                {
                    "source": crawler.source_name,
                    "status": "failed",
                    "error": str(exc),
                }
            )

    return results
