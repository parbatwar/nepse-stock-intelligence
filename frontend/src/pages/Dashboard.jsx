import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [role, setRole] = useState("Viewer");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          userResponse,
          companiesResponse,
        ] = await Promise.all([
          api.get("/auth/me/"),
          api.get("/companies/"),
        ]);

        setRole(userResponse.data.role || "Viewer");

        const companyList = Array.isArray(
          companiesResponse.data
        )
          ? companiesResponse.data
          : [];

        setCompanies(companyList);

        const stats = await Promise.all(
          companyList.map(async (company) => {
            const [
              priceResponse,
              newsResponse,
            ] = await Promise.all([
              api.get(
                `/companies/${company.id}/prices/?range=30d`
              ),

              api.get(
                `/news/?company_id=${company.id}`
              ),
            ]);

            const prices = Array.isArray(
              priceResponse.data
            )
              ? priceResponse.data
              : [];

            const news = Array.isArray(
              newsResponse.data
            )
              ? newsResponse.data
              : [];

            const latest =
              prices.length > 0
                ? prices[prices.length - 1]
                : null;

            const previous =
              prices.length > 1
                ? prices[prices.length - 2]
                : null;

            let changePercent = 0;

            if (
              latest &&
              previous &&
              Number(previous.close) !== 0
            ) {
              changePercent =
                ((Number(latest.close) -
                  Number(previous.close)) /
                  Number(previous.close)) *
                100;
            }

            const returns = [];

            for (let i = 1; i < prices.length; i++) {
              const previousClose = Number(
                prices[i - 1].close
              );

              const currentClose = Number(
                prices[i].close
              );

              if (previousClose !== 0) {
                returns.push(
                  (currentClose - previousClose) /
                    previousClose
                );
              }
            }

            const volatility =
              returns.length > 0
                ? standardDeviation(returns) * 100
                : 0;

            return {
              ...company,

              latestClose: latest
                ? Number(latest.close)
                : null,

              volume: latest
                ? Number(latest.volume)
                : 0,

              changePercent,
              volatility,
              newsCount: news.length,
            };
          })
        );

        setCompanyStats(stats);
      } catch (error) {
        console.error(
          "Dashboard loading failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function exportAnalysis() {
    try {
      setExporting(true);

      const response = await api.get(
        "/export/behavior/",
        {
          responseType: "blob",
        }
      );

      const url =
        window.URL.createObjectURL(
          new Blob([response.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "behavior_analysis.csv"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Export failed:",
        error
      );

      alert(
        "Unable to export analysis."
      );
    } finally {
      setExporting(false);
    }
  }

  const mostActive = useMemo(() => {
    return [...companyStats].sort(
      (a, b) => b.volume - a.volume
    )[0];
  }, [companyStats]);

  const mostVolatile = useMemo(() => {
    return [...companyStats].sort(
      (a, b) =>
        b.volatility - a.volatility
    )[0];
  }, [companyStats]);

  const mostNews = useMemo(() => {
    return [...companyStats].sort(
      (a, b) =>
        b.newsCount - a.newsCount
    )[0];
  }, [companyStats]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Market Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of tracked NEPSE companies.
          </p>
        </div>

        {(role === "Admin" ||
          role === "Analyst") && (
          <button
            onClick={exportAnalysis}
            disabled={exporting}
            className="
              w-fit
              rounded-lg
              bg-slate-900
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {exporting
              ? "Exporting..."
              : "Export CSV"}
          </button>
        )}
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Tracked Companies"
          value={companies.length}
        />

        <SummaryCard
          label="Most Active"
          value={mostActive?.symbol || "N/A"}
          secondary={
            mostActive
              ? `${mostActive.volume.toLocaleString()} volume`
              : ""
          }
        />

        <SummaryCard
          label="Most Volatile"
          value={
            mostVolatile?.symbol || "N/A"
          }
          secondary={
            mostVolatile
              ? `${mostVolatile.volatility.toFixed(
                  2
                )}%`
              : ""
          }
        />

        <SummaryCard
          label="Most in News"
          value={mostNews?.symbol || "N/A"}
          secondary={
            mostNews
              ? `${mostNews.newsCount} ${
                  mostNews.newsCount === 1
                    ? "article"
                    : "articles"
                }`
              : ""
          }
        />
      </div>


      {/* Watchlist */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Watchlist
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest activity across tracked companies.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[850px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">
                  Company
                </th>

                <th className="px-5 py-3">
                  Close
                </th>

                <th className="px-5 py-3">
                  Change
                </th>

                <th className="px-5 py-3">
                  Volume
                </th>

                <th className="px-5 py-3">
                  Volatility
                </th>

                <th className="px-5 py-3">
                  News
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {companyStats.map(
                (company) => (
                  <tr
                    key={company.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/companies/${company.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600"
                      >
                        {company.symbol}
                      </Link>

                      <div className="mt-1 text-xs text-slate-500">
                        {company.name}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {company.latestClose !==
                      null
                        ? `Rs. ${company.latestClose.toLocaleString()}`
                        : "N/A"}
                    </td>

                    <td
                      className={`px-5 py-4 font-medium ${
                        company.changePercent >=
                        0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {company.changePercent >=
                      0
                        ? "+"
                        : ""}

                      {company.changePercent.toFixed(
                        2
                      )}
                      %
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {company.volume.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {company.volatility.toFixed(
                        2
                      )}
                      %
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {company.newsCount}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


function SummaryCard({
  label,
  value,
  secondary,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {value}
      </p>

      {secondary && (
        <p className="mt-1 text-xs text-slate-400">
          {secondary}
        </p>
      )}
    </div>
  );
}


function standardDeviation(values) {
  if (!values.length) {
    return 0;
  }

  const mean =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length;

  const variance =
    values.reduce(
      (sum, value) =>
        sum +
        Math.pow(
          value - mean,
          2
        ),
      0
    ) / values.length;

  return Math.sqrt(variance);
}