import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./components/Pages/Login";
import Dashboard from "./components/Pages/Dashboard";
import GanttChart from "./components/Pages/GanttChart";

// Private Route Wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white/80">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Dashboard is protected */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Gantt Chart is protected */}
          <Route
            path="/schedule"
            element={
              <PrivateRoute>
                <GanttChart />
              </PrivateRoute>
            }
          />

          {/* Default route redirects to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
