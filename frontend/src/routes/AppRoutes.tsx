import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Project from "../pages/Project";
import ProjectPreview from "../pages/ProjectPreview";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuthSuccess from "@/pages/OAuthSuccess";
import { useAuth } from "@/context/AuthContext";
import SessionHandler from "@/components/customComponents/SessionHandler";
import Builder from "@/pages/Builder";

function PrivateRoute({ children }: any) {
  const { user, loading } = useAuth();

  // 🧠 wait for auth to resolve
  if (loading) {
    return null; // or loader
  }

  // 🧠 not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🧠 logged in
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
    <SessionHandler />
      <Routes>

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/builder" element={<Builder />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/project/:id"
          element={
            <PrivateRoute>
              <Project />
            </PrivateRoute>
          }
        />

        <Route
          path="/project/:id/preview"
          element={
            <PrivateRoute>
              <ProjectPreview />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}