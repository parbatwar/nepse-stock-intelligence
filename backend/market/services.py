from datetime import date, timedelta
from decimal import Decimal

import requests

from companies.models import Company
from market.models import DailyPrice

BASE_URL = "https://omitnomis.github.io/" "ShareSansarScraper/api/history/{symbol}.json"


def fetch_symbol_history(symbol: str):
    url = BASE_URL.format(symbol=symbol.upper())

    response = requests.get(
        url,
        timeout=20,
        headers={
            "User-Agent": ("NEPSEStockIntelligence/1.0 " "(technical-assignment)")
        },
    )

    response.raise_for_status()

    return response.json()


def import_company_prices(company: Company, days: int = 35):
    data = fetch_symbol_history(company.symbol)

    cols = data.get("cols", [])
    rows = data.get("rows", [])

    if not cols or not rows:
        return {
            "company": company.symbol,
            "created": 0,
            "updated": 0,
        }

    # Convert compact rows into dictionaries
    records = [dict(zip(cols, row)) for row in rows]

    cutoff = date.today() - timedelta(days=days)

    created_count = 0
    updated_count = 0

    for row in records:
        raw_date = row.get("d")

        if not raw_date:
            continue

        try:
            trade_date = date.fromisoformat(raw_date)
        except ValueError:
            continue

        if trade_date < cutoff:
            continue

        open_price = row.get("o")
        high_price = row.get("h")
        low_price = row.get("l")
        close_price = row.get("c")

        volume = row.get("vol", 0)
        turnover = row.get("to")

        if None in (
            open_price,
            high_price,
            low_price,
            close_price,
        ):
            continue

        _, created = DailyPrice.objects.update_or_create(
            company=company,
            date=trade_date,
            defaults={
                "open": Decimal(str(open_price)),
                "high": Decimal(str(high_price)),
                "low": Decimal(str(low_price)),
                "close": Decimal(str(close_price)),
                "volume": int(volume or 0),
                "turnover": (Decimal(str(turnover)) if turnover is not None else None),
            },
        )

        if created:
            created_count += 1
        else:
            updated_count += 1

    return {
        "company": company.symbol,
        "created": created_count,
        "updated": updated_count,
    }
