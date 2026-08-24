from decimal import Decimal

import numpy as np
import pandas as pd

from analysis.models import BehaviorAnalysis
from companies.models import Company
from market.models import DailyPrice, FloorsheetTransaction


def calculate_pressure(price_change, volume_change):
    if price_change > 0 and volume_change > 0:
        return "STRONG_BUY"

    elif price_change > 0:
        return "WEAK_BUY"

    elif price_change < 0 and volume_change > 0:
        return "STRONG_SELL"

    elif price_change < 0:
        return "WEAK_SELL"

    return "NEUTRAL"


def calculate_vwap(
    company,
    trade_date,
    high,
    low,
    close,
):
    """
    Calculate true VWAP when floorsheet transactions
    are available for the company/date.

    True VWAP:
        sum(rate * quantity) / sum(quantity)

    If floorsheet data is unavailable, fall back to
    typical price:
        (high + low + close) / 3
    """

    transactions = FloorsheetTransaction.objects.filter(
        company=company,
        trade_date=trade_date,
    )

    total_quantity = 0
    total_value = 0.0

    for transaction in transactions:
        quantity = float(transaction.quantity)

        rate = float(transaction.rate)

        total_quantity += quantity
        total_value += rate * quantity

    if total_quantity > 0:
        vwap = total_value / total_quantity

        return (
            vwap,
            "floorsheet_vwap",
        )

    proxy = (float(high) + float(low) + float(close)) / 3

    return (
        proxy,
        "typical_price_proxy",
    )


def analyze_company(company: Company):
    prices = (
        DailyPrice.objects.filter(company=company)
        .order_by("date")
        .values(
            "date",
            "open",
            "high",
            "low",
            "close",
            "volume",
        )
    )

    rows = list(prices)

    if len(rows) < 2:
        return 0

    df = pd.DataFrame(rows)

    # Convert Decimal/database values
    # into numeric values for pandas calculations.
    for col in [
        "open",
        "high",
        "low",
        "close",
    ]:
        df[col] = df[col].astype(float)

    df["volume"] = df["volume"].astype(float)

    # Daily percentage movements.
    df["price_change"] = df["close"].pct_change()

    df["volume_change"] = df["volume"].pct_change()

    # Rolling volume statistics.
    # We compare today's volume against
    # the most recent 10 sessions.
    df["rolling_volume_mean"] = (
        df["volume"]
        .rolling(
            window=10,
            min_periods=3,
        )
        .mean()
    )

    df["rolling_volume_std"] = (
        df["volume"]
        .rolling(
            window=10,
            min_periods=3,
        )
        .std()
    )

    df["volume_ratio"] = df["volume"] / df["rolling_volume_mean"]

    df["volume_zscore"] = (df["volume"] - df["rolling_volume_mean"]) / df[
        "rolling_volume_std"
    ]

    created_or_updated = 0

    for _, row in df.iterrows():
        price_change = (
            float(row["price_change"]) if pd.notna(row["price_change"]) else 0.0
        )

        volume_change = (
            float(row["volume_change"]) if pd.notna(row["volume_change"]) else 0.0
        )

        pressure_label = calculate_pressure(
            price_change,
            volume_change,
        )

        # Simple weighted pressure score.
        pressure_score = np.sign(price_change) * (
            abs(price_change) * 0.7 + abs(volume_change) * 0.3
        )

        volume_ratio = (
            float(row["volume_ratio"]) if pd.notna(row["volume_ratio"]) else None
        )

        volume_zscore = (
            float(row["volume_zscore"]) if pd.notna(row["volume_zscore"]) else None
        )

        # Volume anomaly threshold:
        # >= 2 standard deviations
        # above the recent rolling average.
        volume_anomaly = volume_zscore is not None and volume_zscore >= 2.0

        # IMPORTANT:
        # Use true floorsheet VWAP where
        # transaction-level data exists.
        vwap_value, vwap_method = calculate_vwap(
            company=company,
            trade_date=row["date"],
            high=row["high"],
            low=row["low"],
            close=row["close"],
        )

        BehaviorAnalysis.objects.update_or_create(
            company=company,
            date=row["date"],
            defaults={
                "vwap": Decimal(
                    str(
                        round(
                            vwap_value,
                            2,
                        )
                    )
                ),
                "close_price": Decimal(
                    str(
                        round(
                            row["close"],
                            2,
                        )
                    )
                ),
                "pressure_label": (pressure_label),
                "pressure_score": float(pressure_score),
                "volume_ratio": (volume_ratio),
                "volume_zscore": (volume_zscore),
                "volume_anomaly": (volume_anomaly),
            },
        )

        created_or_updated += 1

    return created_or_updated


def analyze_all_companies():
    results = []

    for company in Company.objects.filter(is_active=True):
        count = analyze_company(company)

        results.append(
            {
                "company": (company.symbol),
                "records": count,
            }
        )

    return results
