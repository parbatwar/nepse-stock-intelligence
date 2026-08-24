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
import Layout from "../components/Layout";


export default function CompanyDetail() {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [prices, setPrices] = useState([]);
  const [behavior, setBehavior] = useState([]);
  const [news, setNews] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [correlation, setCorrelation] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadData() {
      try {
        const [
          companiesResponse,
          pricesResponse,
          behaviorResponse,
          newsResponse,
          brokerResponse,
          correlationResponse,
        ] = await Promise.all([
          api.get("/companies/"),
          api.get(`/companies/${id}/prices/`),
          api.get(`/companies/${id}/behavior-summary/`),
          api.get(`/news/?company_id=${id}`),
          api.get(`/companies/${id}/broker-summary/`),

          api
            .get(`/companies/${id}/news-price-correlation/`)
            .catch(() => ({ data: null })),
        ]);

        const selectedCompany =
          companiesResponse.data.find(
            (item) => String(item.id) === String(id)
          );

        setCompany(selectedCompany || null);
        setPrices(pricesResponse.data);
        setBehavior(behaviorResponse.data);
        setNews(newsResponse.data);
        setBrokers(brokerResponse.data.brokers || []);
        setCorrelation(correlationResponse.data);
      } catch (error) {
        console.error("Failed to load company:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);


  const latestPrice = prices.at(-1);
  const previousPrice = prices.at(-2);

  const priceChange = useMemo(() => {
    if (!latestPrice || !previousPrice) {
      return null;
    }

    const current = Number(latestPrice.close);
    const previous = Number(previousPrice.close);

    return ((current - previous) / previous) * 100;
  }, [latestPrice, previousPrice]);


  const latestBehavior = behavior.at(-1);

  const anomalies = behavior.filter(
    (item) => item.volume_anomaly
  );


  const chartData = prices.map((item) => ({
    date: item.date.slice(5),
    close: Number(item.close),
    volume: Number(item.volume),
  }));


  const topBuyers = [...brokers]
    .filter((item) => item.net_quantity > 0)
    .sort((a, b) => b.net_quantity - a.net_quantity)
    .slice(0, 5);


  const topSellers = [...brokers]
    .filter((item) => item.net_quantity < 0)
    .sort((a, b) => a.net_quantity - b.net_quantity)
    .slice(0, 5);


  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">
          Loading company analysis...
        </p>
      </Layout>
    );
  }


  if (!company) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold">
          Company not found
        </h1>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {company.symbol}
              </h1>

              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                {company.sector}
              </span>
            </div>

            <p className="mt-2 text-slate-500">
              {company.name}
            </p>
          </div>

          {latestPrice && (
            <div className="text-right">
              <p className="text-sm text-slate-500">
                Latest Close
              </p>

              <p className="text-3xl font-bold text-slate-900">
                Rs. {Number(latestPrice.close).toLocaleString()}
              </p>

              {priceChange !== null && (
                <p
                  className={`mt-1 font-medium ${
                    priceChange >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {priceChange >= 0 ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </p>
              )}
            </div>
          )}
        </div>


        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="VWAP Proxy"
            value={
              latestBehavior?.vwap
                ? `Rs. ${Number(
                    latestBehavior.vwap
                  ).toLocaleString()}`
                : "N/A"
            }
          />

          <MetricCard
            label="Pressure"
            value={
              latestBehavior?.pressure_label || "N/A"
            }
          />

          <MetricCard
            label="Volume Z-Score"
            value={
              latestBehavior?.volume_zscore !== null &&
              latestBehavior?.volume_zscore !== undefined
                ? Number(
                    latestBehavior.volume_zscore
                  ).toFixed(2)
                : "N/A"
            }
          />

          <MetricCard
            label="Volume Anomalies"
            value={anomalies.length}
          />
        </div>


        {/* PRICE CHART */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              30-Day Price Trend
            </h2>

            <p className="text-sm text-slate-500">
              Daily closing price
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  fontSize={12}
                />

                <YAxis
                  domain={["auto", "auto"]}
                  fontSize={12}
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


        {/* VOLUME */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Trading Volume
            </h2>

            <p className="text-sm text-slate-500">
              Daily traded quantity
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  fontSize={12}
                />

                <YAxis fontSize={12} />

                <Tooltip />

                <Bar
                  dataKey="volume"
                  fill="#64748b"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>


        {/* BROKERS */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <BrokerCard
            title="Top Net Buyers"
            brokers={topBuyers}
          />

          <BrokerCard
            title="Top Net Sellers"
            brokers={topSellers}
          />

        </div>


        {/* NEWS */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Related News
              </h2>

              <p className="text-sm text-slate-500">
                Automatically categorized articles
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
              {news.length} articles
            </span>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            {news.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">
                No categorized articles available.
              </p>
            ) : (
              news.slice(0, 8).map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block py-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {article.headline}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {article.source}
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


        {/* CORRELATION */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            News / Market Correlation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Exploratory analysis only — not a trading
            signal.
          </p>

          {correlation ? (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

              <MetricCard
                label="News vs Next-Day Volume"
                value={formatCorrelation(
                  correlation.news_count_correlation
                )}
              />

              <MetricCard
                label="Sentiment vs Next-Day Price"
                value={formatCorrelation(
                  correlation.sentiment_price_correlation
                )}
              />

              <MetricCard
                label="Sentiment vs Next-Day Volume"
                value={formatCorrelation(
                  correlation.sentiment_volume_correlation
                )}
              />

            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Not enough overlapping news data for a
              meaningful correlation.
            </p>
          )}
        </section>

      </div>
    </Layout>
  );
}


function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}


function BrokerCard({ title, brokers }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <div className="mt-5 space-y-3">
        {brokers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No sampled floorsheet data available.
          </p>
        ) : (
          brokers.map((broker) => (
            <div
              key={broker.broker}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
            >
              <span className="font-medium">
                Broker {broker.broker}
              </span>

              <span
                className={
                  broker.net_quantity >= 0
                    ? "font-semibold text-emerald-600"
                    : "font-semibold text-red-600"
                }
              >
                {broker.net_quantity >= 0
                  ? "+"
                  : ""}
                {Number(
                  broker.net_quantity
                ).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}


function SentimentBadge({ sentiment }) {
  const styles = {
    positive:
      "bg-emerald-100 text-emerald-700",
    negative:
      "bg-red-100 text-red-700",
    neutral:
      "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[sentiment] || styles.neutral
      }`}
    >
      {sentiment || "neutral"}
    </span>
  );
}


function formatCorrelation(value) {
  if (value === null || value === undefined) {
    return "Insufficient data";
  }

  return Number(value).toFixed(2);
}