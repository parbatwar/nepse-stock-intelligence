import { useEffect, useState } from "react";

import api from "../api";
import Layout from "../components/Layout";

export default function CrawlRuns() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState("");

  async function loadRuns() {
    try {
      const response = await api.get("/admin/crawl-runs/");
      setRuns(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load crawl runs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRuns();

    const interval = setInterval(() => {
      loadRuns();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function triggerCrawl() {
    try {
      setTriggering(true);
      setError("");

      await api.post("/admin/crawl-runs/");

      await loadRuns();
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        setError("Only Admin users can trigger crawls.");
      } else {
        setError("Unable to trigger crawl.");
      }
    } finally {
      setTriggering(false);
    }
  }

  return (
    <Layout>
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Crawl Runs
            </h1>

            <p className="mt-2 text-slate-500">
              Trigger and monitor background news crawling.
            </p>
          </div>

          <button
            onClick={triggerCrawl}
            disabled={triggering}
            className="rounded-lg bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {triggering ? "Queuing..." : "Run News Crawler"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Recent Runs
            </h2>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">
              Loading crawl history...
            </p>
          ) : runs.length === 0 ? (
            <p className="p-6 text-slate-500">
              No crawl runs recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Articles</th>
                    <th className="px-6 py-3">Tags</th>
                    <th className="px-6 py-3">Started</th>
                    <th className="px-6 py-3">Finished</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {runs.map((run) => (
                    <tr key={run.id}>
                      <td className="px-6 py-4 font-medium">
                        #{run.id}
                      </td>

                      <td className="px-6 py-4">
                        {run.crawl_type}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={run.status} />
                      </td>

                      <td className="px-6 py-4">
                        {run.articles_found}
                      </td>

                      <td className="px-6 py-4">
                        {run.records_created}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(run.started_at)}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {run.finished_at
                          ? formatDate(run.finished_at)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatusBadge({ status }) {
  const styles = {
    SUCCESS: "bg-emerald-100 text-emerald-700",
    RUNNING: "bg-blue-100 text-blue-700",
    PARTIAL_SUCCESS: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString();
}