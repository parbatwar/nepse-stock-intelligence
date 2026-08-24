from datetime import datetime

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

from companies.models import Company
from market.models import FloorsheetTransaction

FLOORSHEET_URL = "https://eng.merolagani.com/Floorsheet.aspx"


def import_floorsheet(trade_date):
    """
    trade_date: datetime.date
    """

    tracked_companies = {
        company.symbol: company for company in Company.objects.filter(is_active=True)
    }

    date_text = trade_date.strftime("%m/%d/%Y")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        page = browser.new_page()

        page.goto(
            FLOORSHEET_URL,
            wait_until="domcontentloaded",
            timeout=60000,
        )

        # Fill the actual MeroLagani historical-date field
        date_input = page.locator(
            'input[name="ctl00$ContentPlaceHolder1$txtFloorsheetDateFilter"]'
        )

        date_input.fill(date_text)

        # MeroLagani uses an ASP.NET Search link/button.
        search_button = page.locator('a[title="Search"]').last

        search_button.click()

        # Wait for the result table to update.
        page.wait_for_timeout(2000)

        html = page.content()

        browser.close()

    soup = BeautifulSoup(
        html,
        "lxml",
    )

    # IMPORTANT:
    # Verify that the page actually loaded the requested date.
    page_text = soup.get_text(
        " ",
        strip=True,
    )

    expected_date = trade_date.strftime("%Y/%m/%d")

    if expected_date not in page_text:
        raise ValueError(
            f"MeroLagani did not return requested date "
            f"{trade_date}. Expected to find "
            f"{expected_date} in response."
        )

    created = 0
    skipped = 0

    rows = soup.select("tbody tr")

    for row in rows:
        cells = row.find_all("td")

        if len(cells) < 8:
            continue

        try:
            transaction_no = cells[1].get_text(" ", strip=True)

            symbol = cells[2].get_text(" ", strip=True)

            buyer = cells[3].get_text(" ", strip=True)

            seller = cells[4].get_text(" ", strip=True)

            quantity_text = cells[5].get_text(" ", strip=True).replace(",", "")

            rate_text = cells[6].get_text(" ", strip=True).replace(",", "")

            amount_text = cells[7].get_text(" ", strip=True).replace(",", "")

            if symbol not in tracked_companies:
                continue

            company = tracked_companies[symbol]

            _, was_created = FloorsheetTransaction.objects.update_or_create(
                company=company,
                trade_date=trade_date,
                transaction_no=transaction_no,
                defaults={
                    "buyer_broker": buyer,
                    "seller_broker": seller,
                    "quantity": int(quantity_text),
                    "rate": rate_text,
                    "amount": amount_text,
                },
            )

            if was_created:
                created += 1
            else:
                skipped += 1

        except (
            ValueError,
            IndexError,
        ) as exc:
            print(f"Skipping malformed row: " f"{exc}")

    return {
        "date": trade_date.isoformat(),
        "created": created,
        "existing_or_updated": skipped,
    }
