import { useEffect, useState } from "react";
import api from "../api";

export default function NewsReview() {
  const [news, setNews] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

      const [newsResponse, companiesResponse] =
        await Promise.all([
          api.get("/news/"),
          api.get("/companies/"),
        ]);

      setNews(
        Array.isArray(newsResponse.data)
          ? newsResponse.data
          : []
      );

      setCompanies(
        Array.isArray(companiesResponse.data)
          ? companiesResponse.data
          : []
      );
    } catch (error) {
      console.error("News review loading failed:", error);
      setError("Unable to load news review data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateTag(
    articleId,
    companyId,
    shouldBeTagged
  ) {
    try {
      setUpdatingId(`${articleId}-${companyId}`);

      await api.post(
        `/news/${articleId}/recategorize/`,
        {
          company_id: companyId,
          should_be_tagged: shouldBeTagged,
          reason:
            "Updated through analyst review dashboard",
        }
      );

      await loadData();
    } catch (error) {
      console.error("Tag update failed:", error);

      alert(
        "Unable to update categorization."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          Loading news review...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          News Review
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review automatic company tags and correct
          mis-categorized articles.
        </p>
      </div>

      {news.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            No news articles available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((article) => (
            <ArticleReviewCard
              key={article.id}
              article={article}
              companies={companies}
              onUpdate={updateTag}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleReviewCard({
  article,
  companies,
  onUpdate,
  updatingId,
}) {
  const tags = Array.isArray(article.company_tags)
    ? article.company_tags
    : [];

  const taggedCompanyIds = new Set(
    tags.map((tag) => tag.company)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {article.source || "Unknown source"}
          </p>

          <h2 className="mt-2 text-base font-semibold text-slate-900">
            {article.headline}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {article.published_at && (
              <span>
                {new Date(
                  article.published_at
                ).toLocaleString()}
              </span>
            )}

            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open article
              </a>
            )}
          </div>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {article.sentiment_label || "neutral"}
        </span>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-sm font-medium text-slate-700">
          Company tags
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {companies.map((company) => {
            const checked = taggedCompanyIds.has(
              company.id
            );

            const updateKey =
              `${article.id}-${company.id}`;

            const disabled =
              updatingId === updateKey;

            return (
              <label
                key={company.id}
                className={`
                  cursor-pointer
                  rounded-lg
                  border
                  px-3
                  py-2
                  text-sm
                  transition
                  ${
                    checked
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }
                  ${
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
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

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700">
          Current classification
        </p>

        {tags.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            No company tags assigned.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
              >
                <span className="font-medium text-slate-800">
                  {tag.company_symbol}
                </span>

                <span className="ml-2 text-slate-400">
                  {Math.round(
                    Number(tag.confidence || 0) *
                      100
                  )}
                  %
                </span>

                {tag.is_manual && (
                  <span className="ml-2 text-xs text-amber-600">
                    Manual
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}