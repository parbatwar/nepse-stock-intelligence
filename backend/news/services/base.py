import time
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests


class BaseNewsCrawler:
    user_agent = "NEPSEStockIntelligence/1.0 " "(technical assignment crawler)"

    robots_user_agent = "NEPSEStockIntelligence"

    default_crawl_delay = 1
    timeout = 20

    def __init__(self):
        self.session = requests.Session()

        self.session.headers.update({"User-Agent": self.user_agent})

        self._robots_cache = {}

    def get(self, url):
        robots = self._get_robots_parser(url)

        if not robots.can_fetch(
            self.robots_user_agent,
            url,
        ):
            raise PermissionError(f"robots.txt disallows crawling: {url}")

        crawl_delay = robots.crawl_delay(self.robots_user_agent)

        if crawl_delay is None:
            crawl_delay = robots.crawl_delay("*")

        if crawl_delay is None:
            crawl_delay = self.default_crawl_delay

        time.sleep(crawl_delay)

        response = self.session.get(
            url,
            timeout=self.timeout,
        )

        response.raise_for_status()

        return response

    def _get_robots_parser(self, url):
        parsed = urlparse(url)

        base_url = f"{parsed.scheme}://" f"{parsed.netloc}"

        robots_url = f"{base_url}/robots.txt"

        if robots_url in self._robots_cache:
            return self._robots_cache[robots_url]

        parser = RobotFileParser()

        parser.set_url(robots_url)

        try:
            response = self.session.get(
                robots_url,
                timeout=self.timeout,
            )

            if response.status_code == 200:
                parser.parse(response.text.splitlines())
            else:
                parser.parse([])

        except requests.RequestException:
            parser.parse([])

        self._robots_cache[robots_url] = parser

        return parser
