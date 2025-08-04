import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./components/Pages/Login";
import Signup from "./components/Pages/Signup";
import Dashboard from "./components/Pages/Dashboard";

// Private Route Wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboard is protected */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
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
