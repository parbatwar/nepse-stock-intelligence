import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me/");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load current user:", error);

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const navItemClass = (path) => {
    const active = isActive(path);

    return `
      flex items-center
      justify-center lg:justify-start
      gap-3
      rounded-xl
      px-3 py-3
      transition
      ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }
    `;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-sm font-medium text-slate-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const role = user?.role || "Viewer";

  const isAdmin = role === "Admin";
  const isAnalyst = role === "Analyst";

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className="
          fixed left-0 top-0 z-40
          flex h-screen
          w-20 lg:w-64
          flex-col
          border-r border-slate-800
          bg-slate-950
          text-white
          transition-all
        "
      >
        {/* Logo / title */}
        <div
          className="
            flex h-20 items-center
            justify-center lg:justify-start
            border-b border-slate-800
            px-4 lg:px-6
          "
        >
          <div
            className="
              flex h-10 w-10
              flex-shrink-0
              items-center justify-center
              rounded-xl
              bg-blue-600
              text-sm font-bold
            "
          >
            NS
          </div>

          <div className="ml-3 hidden lg:block">
            <h1 className="text-base font-bold">
              NEPSE Intelligence
            </h1>

            <p className="mt-0.5 text-xs text-slate-400">
              Stock Market Dashboard
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-3 lg:p-4">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={navItemClass("/dashboard")}
            title="Dashboard"
          >
            <span className="text-lg">
              ◫
            </span>

            <span className="hidden text-sm font-medium lg:inline">
              Dashboard
            </span>
          </Link>

          {/* News Review - Analyst and Admin */}
          {(isAnalyst || isAdmin) && (
            <Link
              to="/news-review"
              className={navItemClass("/news-review")}
              title="News Review"
            >
              <span className="text-lg">
                ✓
              </span>

              <span className="hidden text-sm font-medium lg:inline">
                News Review
              </span>
            </Link>
          )}

          {/* Crawl Runs - Admin only */}
          {isAdmin && (
            <Link
              to="/crawl-runs"
              className={navItemClass("/crawl-runs")}
              title="Crawl Runs"
            >
              <span className="text-lg">
                ↻
              </span>

              <span className="hidden text-sm font-medium lg:inline">
                Crawl Runs
              </span>
            </Link>
          )}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 p-3 lg:p-4">
          <button
            onClick={handleLogout}
            title="Logout"
            className="
              flex w-full
              items-center
              justify-center lg:justify-start
              gap-3
              rounded-xl
              px-3 py-3
              text-sm font-medium
              text-slate-300
              transition
              hover:bg-red-500/10
              hover:text-red-400
            "
          >

            <span className="hidden lg:inline">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-20 min-h-screen lg:ml-64">
        {/* Top bar */}
        <header
          className="
            sticky top-0 z-30
            flex h-20
            items-center
            justify-between
            border-b border-slate-200
            bg-white/95
            px-4
            backdrop-blur
            md:px-6
            lg:px-8
          "
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">
              NEPSE Stock Intelligence
            </h2>

            <p className="hidden text-sm text-slate-500 md:block">
              Market data, news intelligence and behavior analysis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.username}
              </p>

              <p className="text-xs text-slate-500">
                {role}
              </p>
            </div>

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                bg-slate-900
                text-sm font-bold
                text-white
              "
            >
              {user?.username
                ? user.username.charAt(0).toUpperCase()
                : "U"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="
            w-full
            p-4
            md:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;