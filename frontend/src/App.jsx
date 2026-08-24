import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CompanyDetail from "./pages/CompanyDetail";
import NewsReview from "./pages/NewsReview";
import CrawlRuns from "./pages/CrawlRuns";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public login page */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* Protected application */}
        <Route element={<ProtectedRoute />}>

          {/* Shared sidebar + top navbar */}
          <Route element={<Layout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/companies/:id"
              element={<CompanyDetail />}
            />

            <Route
              path="/news-review"
              element={<NewsReview />}
            />

            <Route
              path="/crawl-runs"
              element={<CrawlRuns />}
            />

          </Route>

        </Route>


        {/* Unknown URLs */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;