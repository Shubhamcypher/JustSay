import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import ProjectPage from "@/pages/project/ProjectPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuthSuccess from "@/pages/OAuthSuccess";
import Builder from "@/pages/builder/Builder";

import { useAuth } from "@/context/AuthContext";
import SessionHandler from "@/components/customComponents/SessionHandler";

function PrivateRoute({ children }: any) {
  const { user, loading } = useAuth();

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

        {/* Project Details */}
        <Route
          path="/project/:id"
          element={
            <PrivateRoute>
              <ProjectPage />
            </PrivateRoute>
          }
        />

        {/* Builder - New Project */}
        <Route
          path="/builder"
          element={
            <PrivateRoute>
              <Builder />
            </PrivateRoute>
          }
        />

        {/* Builder - Edit Existing Project */}
        <Route
          path="/builder/:id"
          element={
            <PrivateRoute>
              <Builder />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}