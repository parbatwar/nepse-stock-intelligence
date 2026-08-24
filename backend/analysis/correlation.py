import math

import pandas as pd
from scipy.stats import pearsonr

from analysis.models import NewsMarketCorrelation
from companies.models import Company
from market.models import DailyPrice
from news.models import NewsCompanyTag


def safe_correlation(x, y):
    pairs = [(a, b) for a, b in zip(x, y) if pd.notna(a) and pd.notna(b)]

    if len(pairs) < 3:
        return None

    x_clean = [p[0] for p in pairs]
    y_clean = [p[1] for p in pairs]

    # Pearson correlation fails/has no meaning
    # if one side has no variation.
    if len(set(x_clean)) <= 1 or len(set(y_clean)) <= 1:
        return None

    result = pearsonr(x_clean, y_clean)

    value = float(result.statistic)

    if math.isnan(value):
        return None

    return value


def build_company_correlation(company: Company):
    prices = list(
        DailyPrice.objects.filter(company=company)
        .order_by("date")
        .values(
            "date",
            "close",
            "volume",
        )
    )

    if len(prices) < 3:
        return None

    price_df = pd.DataFrame(prices)

    price_df["close"] = price_df["close"].astype(float)
    price_df["volume"] = price_df["volume"].astype(float)

    # Future market movement
    price_df["next_day_return"] = price_df["close"].shift(-1) / price_df["close"] - 1

    price_df["next_2d_return"] = price_df["close"].shift(-2) / price_df["close"] - 1

    price_df["next_day_volume_change"] = (
        price_df["volume"].shift(-1) / price_df["volume"] - 1
    )

    # Get categorized articles for this company.
    tags = NewsCompanyTag.objects.filter(company=company).select_related("article")

    news_rows = []

    for tag in tags:
        article = tag.article

        # We need a date for correlation.
        # Prefer article publish date.
        # Fall back to crawled date.
        dt = article.published_at or article.crawled_at

        sentiment = article.sentiment_score

        news_rows.append(
            {
                "date": dt.date(),
                "sentiment": (float(sentiment) if sentiment is not None else 0.0),
                "confidence": float(tag.confidence),
            }
        )

    if news_rows:
        news_df = pd.DataFrame(news_rows)

        # Confidence-weighted sentiment.
        news_df["weighted_sentiment"] = news_df["sentiment"] * news_df["confidence"]

        daily_news = (
            news_df.groupby("date")
            .agg(
                news_count=("date", "size"),
                avg_sentiment=(
                    "weighted_sentiment",
                    "mean",
                ),
            )
            .reset_index()
        )

        merged = price_df.merge(
            daily_news,
            on="date",
            how="left",
        )

    else:
        merged = price_df.copy()
        merged["news_count"] = 0
        merged["avg_sentiment"] = 0.0

    merged["news_count"] = merged["news_count"].fillna(0)

    merged["avg_sentiment"] = merged["avg_sentiment"].fillna(0.0)

    news_volume_corr = safe_correlation(
        merged["news_count"],
        merged["next_day_volume_change"],
    )

    sentiment_price_corr = safe_correlation(
        merged["avg_sentiment"],
        merged["next_day_return"],
    )

    sentiment_volume_corr = safe_correlation(
        merged["avg_sentiment"],
        merged["next_day_volume_change"],
    )

    result, _ = NewsMarketCorrelation.objects.update_or_create(
        company=company,
        period_start=price_df["date"].min(),
        period_end=price_df["date"].max(),
        defaults={
            "news_count_correlation": news_volume_corr,
            "sentiment_price_correlation": sentiment_price_corr,
            "sentiment_volume_correlation": sentiment_volume_corr,
            "sample_size": len(merged),
        },
    )

    return {
        "company": company.symbol,
        "news_volume_corr": news_volume_corr,
        "sentiment_price_corr": sentiment_price_corr,
        "sentiment_volume_corr": sentiment_volume_corr,
        "sample_size": len(merged),
    }


def build_all_correlations():
    results = []

    for company in Company.objects.filter(is_active=True):
        result = build_company_correlation(company)

        if result:
            results.append(result)

    return results
