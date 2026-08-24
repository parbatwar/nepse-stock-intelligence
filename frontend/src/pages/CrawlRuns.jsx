import { useEffect, useState } from "react";

import api from "../api";

export default function CrawlRuns() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState("");

  async function loadRuns() {
    try {
      const response = await api.get(
        "/admin/crawl-runs/"
      );

      setRuns(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setError("");
    } catch (err) {
      console.error(
        "Failed to load crawl runs:",
        err
      );

      setError(
        "Unable to load crawl runs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRuns();

    const interval = setInterval(
      loadRuns,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  async function triggerCrawl() {
    try {
      setTriggering(true);
      setError("");

      await api.post(
        "/admin/crawl-runs/"
      );

      await loadRuns();
    } catch (err) {
      console.error(
        "Failed to trigger crawl:",
        err
      );

      if (
        err.response?.status === 403
      ) {
        setError(
          "Only Admin users can trigger crawl runs."
        );
      } else {
        setError(
          "Unable to trigger crawl."
        );
      }
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Crawl Runs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Trigger and monitor background news crawling.
          </p>
        </div>

        <button
          onClick={triggerCrawl}
          disabled={triggering}
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
          {triggering
            ? "Starting..."
            : "Run Crawler"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Runs
          </h2>
        </div>

        {loading ? (
          <div className="p-5">
            <p className="text-sm text-slate-500">
              Loading crawl history...
            </p>
          </div>
        ) : runs.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-slate-500">
              No crawl runs recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    ID
                  </th>

                  <th className="px-5 py-3">
                    Type
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Articles
                  </th>

                  <th className="px-5 py-3">
                    Records
                  </th>

                  <th className="px-5 py-3">
                    Started
                  </th>

                  <th className="px-5 py-3">
                    Finished
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      #{run.id}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {run.crawl_type}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={run.status}
                      />
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {run.articles_found ?? 0}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {run.records_created ?? 0}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(
                        run.started_at
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(
                        run.finished_at
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    SUCCESS:
      "bg-emerald-50 text-emerald-700",
    RUNNING:
      "bg-blue-50 text-blue-700",
    PARTIAL_SUCCESS:
      "bg-amber-50 text-amber-700",
    FAILED:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-xs
        font-medium
        ${
          styles[status] ||
          "bg-slate-100 text-slate-700"
        }
      `}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString();
}