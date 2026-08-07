import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Builder from "../pages/builder/Builder";
import ProjectPreview from "../pages/project/ProjectPreview";

export default function AppRoutes() {
  const basename =
  import.meta.env.PROD ? "/builder" : "/";
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Builder />} />

        <Route path="/:projectId" element={<Builder />} />

        <Route
          path="/project/:projectId"
          element={<ProjectPreview />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}