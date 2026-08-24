import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../api";


export default function CompanyDetail() {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [prices, setPrices] = useState([]);
  const [behavior, setBehavior] = useState([]);
  const [news, setNews] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [correlation, setCorrelation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          companiesResponse,
          pricesResponse,
          behaviorResponse,
          newsResponse,
          brokerResponse,
          correlationResponse,
        ] = await Promise.all([
          api.get("/companies/"),

          api.get(
            `/companies/${id}/prices/?range=30d`
          ),

          api.get(
            `/companies/${id}/behavior-summary/`
          ),

          api.get(
            `/news/?company_id=${id}`
          ),

          api.get(
            `/companies/${id}/broker-summary/`
          ),

          api
            .get(
              `/companies/${id}/news-price-correlation/`
            )
            .catch(() => ({
              data: null,
            })),
        ]);

        const companyList = Array.isArray(
          companiesResponse.data
        )
          ? companiesResponse.data
          : [];

        const selectedCompany =
          companyList.find(
            (item) =>
              String(item.id) === String(id)
          );

        setCompany(
          selectedCompany || null
        );

        setPrices(
          Array.isArray(pricesResponse.data)
            ? pricesResponse.data
            : []
        );

        setBehavior(
          Array.isArray(
            behaviorResponse.data
          )
            ? behaviorResponse.data
            : []
        );

        setNews(
          Array.isArray(newsResponse.data)
            ? newsResponse.data
            : []
        );

        setBrokers(
          Array.isArray(
            brokerResponse.data?.brokers
          )
            ? brokerResponse.data.brokers
            : []
        );

        setCorrelation(
          correlationResponse.data
        );
      } catch (error) {
        console.error(
          "Failed to load company detail:",
          error
        );

        setError(
          "Unable to load company analysis."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);


  const latestPrice =
    prices.length > 0
      ? prices[prices.length - 1]
      : null;

  const previousPrice =
    prices.length > 1
      ? prices[prices.length - 2]
      : null;

  const latestBehavior =
    behavior.length > 0
      ? behavior[behavior.length - 1]
      : null;


  const priceChange = useMemo(() => {
    if (
      !latestPrice ||
      !previousPrice
    ) {
      return null;
    }

    const current = Number(
      latestPrice.close
    );

    const previous = Number(
      previousPrice.close
    );

    if (!previous) {
      return null;
    }

    return (
      ((current - previous) /
        previous) *
      100
    );
  }, [
    latestPrice,
    previousPrice,
  ]);


  const anomalyCount =
    behavior.filter(
      (item) =>
        item.volume_anomaly === true
    ).length;


  const chartData = prices.map(
    (item) => ({
      date: item.date
        ? item.date.slice(5)
        : "",
      close: Number(
        item.close || 0
      ),
      volume: Number(
        item.volume || 0
      ),
    })
  );


  const topBuyers = [...brokers]
    .filter(
      (item) =>
        Number(
          item.net_quantity
        ) > 0
    )
    .sort(
      (a, b) =>
        Number(
          b.net_quantity
        ) -
        Number(
          a.net_quantity
        )
    )
    .slice(0, 5);


  const topSellers = [...brokers]
    .filter(
      (item) =>
        Number(
          item.net_quantity
        ) < 0
    )
    .sort(
      (a, b) =>
        Number(
          a.net_quantity
        ) -
        Number(
          b.net_quantity
        )
    )
    .slice(0, 5);


  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          Loading company analysis...
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


  if (!company) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Company not found
        </h1>
      </div>
    );
  }


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              {company.symbol}
            </h1>

            {company.sector && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {company.sector}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {company.name}
          </p>
        </div>

        {latestPrice && (
          <div className="md:text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Latest Close
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-900">
              Rs.{" "}
              {Number(
                latestPrice.close
              ).toLocaleString()}
            </p>

            {priceChange !== null && (
              <p
                className={`mt-1 text-sm font-medium ${
                  priceChange >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {priceChange >= 0
                  ? "+"
                  : ""}
                {priceChange.toFixed(
                  2
                )}
                %
              </p>
            )}
          </div>
        )}
      </div>


      {/* Analysis summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="VWAP / Price Proxy"
          value={
            latestBehavior?.vwap
              ? `Rs. ${Number(
                  latestBehavior.vwap
                ).toLocaleString()}`
              : "N/A"
          }
        />

        <MetricCard
          label="Buy / Sell Pressure"
          value={
            latestBehavior?.pressure_label ||
            "N/A"
          }
        />

        <MetricCard
          label="Volume Z-Score"
          value={
            latestBehavior?.volume_zscore !==
              null &&
            latestBehavior?.volume_zscore !==
              undefined
              ? Number(
                  latestBehavior.volume_zscore
                ).toFixed(2)
              : "N/A"
          }
        />

        <MetricCard
          label="Volume Anomalies"
          value={anomalyCount}
        />
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Price */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              30-Day Price Trend
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Daily closing price
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={chartData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  fontSize={11}
                />

                <YAxis
                  domain={[
                    "auto",
                    "auto",
                  ]}
                  fontSize={11}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>


        {/* Volume */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Trading Volume
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Daily traded quantity
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  fontSize={11}
                />

                <YAxis
                  fontSize={11}
                />

                <Tooltip />

                <Bar
                  dataKey="volume"
                  fill="#64748b"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>


      {/* Broker activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BrokerCard
          title="Most Active Buyers"
          brokers={topBuyers}
        />

        <BrokerCard
          title="Most Active Sellers"
          brokers={topSellers}
        />
      </div>


      {/* News */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Categorized News
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Articles tagged to this company
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {news.length} articles
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {news.length === 0 ? (
            <p className="py-5 text-sm text-slate-500">
              No categorized articles available.
            </p>
          ) : (
            news
              .slice(0, 8)
              .map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">
                        {
                          article.headline
                        }
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {
                          article.source
                        }
                      </p>
                    </div>

                    <SentimentBadge
                      sentiment={
                        article.sentiment_label
                      }
                    />
                  </div>
                </a>
              ))
          )}
        </div>
      </section>


      {/* Correlation */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          News / Market Correlation
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Exploratory comparison of news activity
          with subsequent market movement.
        </p>

        {correlation ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SmallMetric
              label="News vs Next-Day Volume"
              value={formatCorrelation(
                correlation.news_count_correlation
              )}
            />

            <SmallMetric
              label="Sentiment vs Next-Day Price"
              value={formatCorrelation(
                correlation.sentiment_price_correlation
              )}
            />

            <SmallMetric
              label="Sentiment vs Next-Day Volume"
              value={formatCorrelation(
                correlation.sentiment_volume_correlation
              )}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Not enough overlapping data for
            a meaningful correlation.
          </p>
        )}
      </section>

    </div>
  );
}


function MetricCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}


function SmallMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}


function BrokerCard({
  title,
  brokers,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        {title}
      </h2>

      <div className="mt-4 space-y-2">
        {brokers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No sampled floorsheet data available.
          </p>
        ) : (
          brokers.map(
            (broker) => (
              <div
                key={
                  broker.broker
                }
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  Broker{" "}
                  {
                    broker.broker
                  }
                </span>

                <span
                  className={`text-sm font-semibold ${
                    Number(
                      broker.net_quantity
                    ) >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {Number(
                    broker.net_quantity
                  ) >= 0
                    ? "+"
                    : ""}

                  {Number(
                    broker.net_quantity
                  ).toLocaleString()}
                </span>
              </div>
            )
          )
        )}
      </div>
    </section>
  );
}


function SentimentBadge({
  sentiment,
}) {
  const styles = {
    positive:
      "bg-emerald-50 text-emerald-700",

    negative:
      "bg-red-50 text-red-700",

    neutral:
      "bg-slate-100 text-slate-600",
  };

  const value =
    sentiment || "neutral";

  return (
    <span
      className={`
        w-fit
        rounded-full
        px-2.5
        py-1
        text-xs
        font-medium
        ${
          styles[value] ||
          styles.neutral
        }
      `}
    >
      {value}
    </span>
  );
}


function formatCorrelation(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "Insufficient data";
  }

  return Number(
    value
  ).toFixed(2);
}