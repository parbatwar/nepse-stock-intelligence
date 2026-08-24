import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import CompanyDetail from "./pages/CompanyDetail";
import NewsReview from "./pages/NewsReview";
import CrawlRuns from "./pages/CrawlRuns";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
            path="/companies/:id"
            element={
                <ProtectedRoute>
                <CompanyDetail />
                </ProtectedRoute>
            }
        />
        <Route
            path="/news"
            element={
                <ProtectedRoute>
                <NewsReview />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin/crawls"
            element={
                <ProtectedRoute>
                <CrawlRuns />
                </ProtectedRoute>
            }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;