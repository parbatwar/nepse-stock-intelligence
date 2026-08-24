import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const companiesResponse = await api.get("/companies/");
        const companyList = companiesResponse.data;

        setCompanies(companyList);

        const stats = await Promise.all(
          companyList.map(async (company) => {
            const [
              priceResponse,
              behaviorResponse,
              newsResponse,
            ] = await Promise.all([
              api.get(`/companies/${company.id}/prices/`),
              api.get(
                `/companies/${company.id}/behavior-summary/`
              ),
              api.get(`/news/?company_id=${company.id}`),
            ]);

            const prices = priceResponse.data;
            const behavior = behaviorResponse.data;

            const latest = prices.at(-1);
            const previous = prices.at(-2);

            let changePercent = 0;

            if (latest && previous) {
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

              returns.push(
                (currentClose - previousClose) /
                  previousClose
              );
            }

            const volatility =
              returns.length > 0
                ? standardDeviation(returns) * 100
                : 0;

            const anomalies = behavior.filter(
              (item) => item.volume_anomaly
            ).length;

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
              newsCount: newsResponse.data.length,
              anomalies,
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

  const mostActive = useMemo(() => {
    return [...companyStats].sort(
      (a, b) => b.volume - a.volume
    )[0];
  }, [companyStats]);

  const mostVolatile = useMemo(() => {
    return [...companyStats].sort(
      (a, b) => b.volatility - a.volatility
    )[0];
  }, [companyStats]);

  const mostNews = useMemo(() => {
    return [...companyStats].sort(
      (a, b) => b.newsCount - a.newsCount
    )[0];
  }, [companyStats]);

  const totalAnomalies = companyStats.reduce(
    (total, item) => total + item.anomalies,
    0
  );

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Market Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Cross-company market intelligence and behavior
          analysis.
        </p>

        {loading ? (
          <p className="mt-8 text-slate-500">
            Loading dashboard...
          </p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Tracked Companies"
                value={companies.length}
              />

              <SummaryCard
                label="Most Active"
                value={
                  mostActive?.symbol || "N/A"
                }
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
                label="Volume Anomalies"
                value={totalAnomalies}
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <RankingCard
                title="Most Active"
                data={[...companyStats].sort(
                  (a, b) => b.volume - a.volume
                )}
                renderValue={(item) =>
                  item.volume.toLocaleString()
                }
              />

              <RankingCard
                title="Most Volatile"
                data={[...companyStats].sort(
                  (a, b) =>
                    b.volatility - a.volatility
                )}
                renderValue={(item) =>
                  `${item.volatility.toFixed(2)}%`
                }
              />

              <RankingCard
                title="Most in the News"
                data={[...companyStats].sort(
                  (a, b) =>
                    b.newsCount - a.newsCount
                )}
                renderValue={(item) =>
                  `${item.newsCount} articles`
                }
              />
            </div>

            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900">
                Watchlist
              </h2>

              <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-3">
                        Company
                      </th>
                      <th className="px-6 py-3">
                        Close
                      </th>
                      <th className="px-6 py-3">
                        Change
                      </th>
                      <th className="px-6 py-3">
                        Volume
                      </th>
                      <th className="px-6 py-3">
                        Volatility
                      </th>
                      <th className="px-6 py-3">
                        News
                      </th>
                      <th className="px-6 py-3">
                        Anomalies
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {companyStats.map((company) => (
                      <tr key={company.id}>
                        <td className="px-6 py-4">
                          <Link
                            to={`/companies/${company.id}`}
                            className="font-semibold text-slate-900 hover:underline"
                          >
                            {company.symbol}
                          </Link>

                          <div className="text-xs text-slate-500">
                            {company.name}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {company.latestClose
                            ? `Rs. ${company.latestClose.toLocaleString()}`
                            : "N/A"}
                        </td>

                        <td
                          className={`px-6 py-4 font-medium ${
                            company.changePercent >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {company.changePercent >= 0
                            ? "+"
                            : ""}
                          {company.changePercent.toFixed(
                            2
                          )}
                          %
                        </td>

                        <td className="px-6 py-4">
                          {company.volume.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          {company.volatility.toFixed(2)}%
                        </td>

                        <td className="px-6 py-4">
                          {company.newsCount}
                        </td>

                        <td className="px-6 py-4">
                          {company.anomalies}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

function SummaryCard({
  label,
  value,
  secondary,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
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

function RankingCard({
  title,
  data,
  renderValue,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">
        {title}
      </h2>

      <div className="mt-5 space-y-3">
        {data.slice(0, 5).map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-xs text-slate-400">
                {index + 1}
              </span>

              <span className="font-medium">
                {item.symbol}
              </span>
            </div>

            <span className="text-sm text-slate-500">
              {renderValue(item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function standardDeviation(values) {
  if (!values.length) return 0;

  const mean =
    values.reduce((sum, value) => sum + value, 0) /
    values.length;

  const variance =
    values.reduce(
      (sum, value) =>
        sum + Math.pow(value - mean, 2),
      0
    ) / values.length;

  return Math.sqrt(variance);
}