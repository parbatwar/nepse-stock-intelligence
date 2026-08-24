from datetime import datetime
from decimal import Decimal

import requests
from bs4 import BeautifulSoup

from companies.models import Company
from market.models import FloorsheetTransaction

BASE_URL = "https://eng.merolagani.com/Floorsheet.aspx"


def clean_number(value):
    if value is None:
        return None

    value = value.replace(",", "").strip()

    if not value:
        return None

    return value


def fetch_floorsheet_page():
    response = requests.get(
        BASE_URL,
        timeout=30,
        headers={
            "User-Agent": ("NEPSEStockIntelligence/1.0 " "(technical-assignment)")
        },
    )

    response.raise_for_status()

    return response.text


def parse_floorsheet(html):
    soup = BeautifulSoup(html, "lxml")

    rows = []

    table = soup.find("table")

    if not table:
        return rows

    tbody = table.find("tbody")

    if not tbody:
        return rows

    for tr in tbody.find_all("tr"):
        cells = [td.get_text(" ", strip=True) for td in tr.find_all("td")]

        # Expected:
        # index, transaction no, symbol,
        # buyer, seller, quantity, rate, amount
        if len(cells) < 8:
            continue

        rows.append(
            {
                "transaction_no": cells[1],
                "symbol": cells[2],
                "buyer_broker": cells[3],
                "seller_broker": cells[4],
                "quantity": clean_number(cells[5]),
                "rate": clean_number(cells[6]),
                "amount": clean_number(cells[7]),
            }
        )

    return rows


def import_floorsheet(trade_date):
    html = fetch_floorsheet_page()

    rows = parse_floorsheet(html)

    tracked = {
        company.symbol: company for company in Company.objects.filter(is_active=True)
    }

    created_count = 0

    for row in rows:
        symbol = row["symbol"]

        if symbol not in tracked:
            continue

        company = tracked[symbol]

        _, created = FloorsheetTransaction.objects.get_or_create(
            company=company,
            trade_date=trade_date,
            transaction_no=row["transaction_no"],
            defaults={
                "buyer_broker": row["buyer_broker"],
                "seller_broker": row["seller_broker"],
                "quantity": int(row["quantity"]),
                "rate": Decimal(row["rate"]),
                "amount": (Decimal(row["amount"]) if row["amount"] else None),
            },
        )

        if created:
            created_count += 1

    return {
        "rows_found": len(rows),
        "created": created_count,
    }
