import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuthSuccess from "@/pages/OAuthSuccess";


import { useAuth } from "@/context/AuthContext";
import SessionHandler from "@/components/customComponents/SessionHandler";
import type { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  console.log("PrivateRoute", {
    loading,
    user,
  });

  // Wait until auth state is resolved
  if (loading) {
    return null; // TODO: Replace with SplashScreen
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <SessionHandler />

      <Routes>

        {/* ───────────── Public Routes ───────────── */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* ───────────── Protected Routes ───────────── */}

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />



        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}