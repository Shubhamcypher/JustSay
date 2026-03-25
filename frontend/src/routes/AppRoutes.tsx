import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Project from "../pages/Project";
import ProjectPreview from "../pages/ProjectPreview";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuthSuccess from "@/pages/OAuthSuccess";

function PrivateRoute({ children }: any) {
  const token = localStorage.getItem("accessToken");
  

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;

}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
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