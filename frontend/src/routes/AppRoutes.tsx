// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "../pages/Dashboard";
// import Project from "../pages/Project";
// import ProjectPreview from "../pages/ProjectPreview";

// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/project/:id" element={<Project />} />
//         <Route path="/project/:id/preview" element={<ProjectPreview />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Project from "../pages/Project";
import ProjectPreview from "../pages/ProjectPreview";
import Login from "../pages/Login";
import Register from "../pages/Register";

function PrivateRoute({ children }: any) {
  const token = localStorage.getItem("accessToken");

  return token ? children : <Navigate to="/login" />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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