import re

from companies.models import Company
from news.models import NewsArticle, NewsCompanyTag


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def calculate_company_score(article: NewsArticle, company: Company) -> float:
    headline = normalize_text(article.headline)
    body = normalize_text(article.body)

    aliases = list(company.aliases or [])

    # Always include symbol and official company name.
    aliases.extend(
        [
            company.symbol,
            company.name,
        ]
    )

    aliases = {alias.lower().strip() for alias in aliases if alias and alias.strip()}

    score = 0.0

    for alias in aliases:
        escaped_alias = re.escape(alias)

        headline_matches = len(
            re.findall(
                rf"\b{escaped_alias}\b",
                headline,
                flags=re.IGNORECASE,
            )
        )

        body_matches = len(
            re.findall(
                rf"\b{escaped_alias}\b",
                body,
                flags=re.IGNORECASE,
            )
        )

        # Headline match is strong evidence.
        if headline_matches:
            score += 0.70

        # Body match adds supporting evidence.
        if body_matches:
            score += 0.20

        # Multiple mentions slightly increase confidence.
        if body_matches >= 2:
            score += 0.05

        if body_matches >= 4:
            score += 0.05

    return min(score, 1.0)


def categorize_article(article: NewsArticle, minimum_confidence=0.50):
    results = []

    companies = Company.objects.filter(is_active=True)

    for company in companies:
        confidence = calculate_company_score(
            article,
            company,
        )

        if confidence < minimum_confidence:
            continue

        tag, _ = NewsCompanyTag.objects.update_or_create(
            article=article,
            company=company,
            defaults={
                "confidence": confidence,
                "method": "entity_alias_matching",
                "is_manual": False,
            },
        )

        results.append(tag)

    return results


def categorize_uncategorized_articles():
    processed = 0
    tags_created = 0

    articles = NewsArticle.objects.all()

    for article in articles:
        tags = categorize_article(article)

        processed += 1
        tags_created += len(tags)

    return {
        "processed": processed,
        "tags_created": tags_created,
    }
