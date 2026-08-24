import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me/")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        logout();
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 p-6 text-white">
        <h1 className="text-xl font-bold">
          NEPSE Intelligence
        </h1>

        {user && (
          <div className="mt-6 rounded-lg bg-slate-900 p-3">
            <p className="text-sm font-medium">
              {user.username}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {user.role}
            </p>
          </div>
        )}

        <nav className="mt-8 space-y-2">
          <Link
            to="/dashboard"
            className="block rounded-lg px-3 py-2 hover:bg-slate-800"
          >
            Dashboard
          </Link>

          {(user?.role === "Admin" ||
            user?.role === "Analyst") && (
            <Link
              to="/news"
              className="block rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              News Review
            </Link>
          )}

          {user?.role === "Admin" && (
            <Link
              to="/admin/crawls"
              className="block rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Crawl Runs
            </Link>
          )}
        </nav>

        <button
          onClick={logout}
          className="absolute bottom-6 left-6 rounded-lg bg-slate-800 px-4 py-2"
        >
          Logout
        </button>
      </aside>

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}