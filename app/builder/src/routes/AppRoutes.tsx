import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Builder from "@/pages/builder/Builder";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Create new project */}
        <Route path="/builder" element={<Builder />} />

        {/* Edit existing project */}
        <Route path="/builder/:projectId" element={<Builder />} />

        <Route path="*" element={<Navigate to="/builder" replace />} />
      </Routes>
    </BrowserRouter>
  );
}