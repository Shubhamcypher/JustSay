import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Project from "../pages/Project";
import ProjectPreview from "../pages/ProjectPreview";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:id" element={<Project />} />
        <Route path="/project/:id" element={<ProjectPreview />} />
      </Routes>
    </BrowserRouter>
  );
}