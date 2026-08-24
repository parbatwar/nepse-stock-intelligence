from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from news.models import NewsArticle

analyzer = SentimentIntensityAnalyzer()


def analyze_article_sentiment(article: NewsArticle):
    text = f"{article.headline}. {article.body or ''}"

    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    article.sentiment_label = label
    article.sentiment_score = compound

    article.save(
        update_fields=[
            "sentiment_label",
            "sentiment_score",
        ]
    )

    return {
        "label": label,
        "score": compound,
    }


def analyze_all_articles():
    processed = 0

    for article in NewsArticle.objects.all():
        analyze_article_sentiment(article)
        processed += 1

    return processed
