import time
from abc import ABC, abstractmethod

import requests


class BaseNewsCrawler(ABC):
    source_name = ""
    crawl_delay = 1.0

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "NEPSEStockIntelligence/1.0 " "(technical assignment crawler)"
                )
            }
        )

    def get(self, url):
        response = self.session.get(url, timeout=20)
        response.raise_for_status()

        time.sleep(self.crawl_delay)

        return response

    @abstractmethod
    def crawl(self):
        raise NotImplementedError
