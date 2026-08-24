import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function NewsReview() {
  const [news, setNews] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [newsResponse, companiesResponse] = await Promise.all([
        api.get("/news/"),
        api.get("/companies/"),
      ]);

      setNews(newsResponse.data);
      setCompanies(companiesResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateTag(articleId, companyId, shouldBeTagged) {
    try {
      await api.post(`/news/${articleId}/recategorize/`, {
        company_id: companyId,
        should_be_tagged: shouldBeTagged,
        reason: "Updated through analyst review dashboard",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Unable to update categorization.");
    }
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          News Review
        </h1>

        <p className="mt-2 text-slate-500">
          Review automatic company tags and correct mis-categorized articles.
        </p>

        {loading ? (
          <p className="mt-8 text-slate-500">Loading...</p>
        ) : (
          <div className="mt-8 space-y-6">
            {news.map((article) => (
              <ArticleReviewCard
                key={article.id}
                article={article}
                companies={companies}
                onUpdate={updateTag}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ArticleReviewCard({ article, companies, onUpdate }) {
  const taggedCompanyIds = new Set(
    article.company_tags.map((tag) => tag.company)
  );

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {article.source}
          </p>

          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            {article.headline}
          </h2>

          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-blue-600 hover:underline"
          >
            Open source article
          </a>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {article.sentiment_label || "neutral"}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-700">
          Company tags
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {companies.map((company) => {
            const checked = taggedCompanyIds.has(company.id);

            return (
              <label
                key={company.id}
                className={`cursor-pointer rounded-full border px-3 py-2 text-sm ${
                  checked
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    onUpdate(
                      article.id,
                      company.id,
                      e.target.checked
                    )
                  }
                  className="hidden"
                />

                {company.symbol}
              </label>
            );
          })}
        </div>
      </div>

      {article.company_tags.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-700">
            Current classification
          </p>

          <div className="mt-2 space-y-1">
            {article.company_tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 text-sm text-slate-600"
              >
                <span className="font-medium">
                  {tag.company_symbol}
                </span>

                <span>
                  {(tag.confidence * 100).toFixed(0)}%
                </span>

                <span className="text-slate-400">
                  {tag.method}
                </span>

                {tag.is_manual && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    Manual
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}