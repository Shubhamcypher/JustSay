import { BrowserRouter, Routes, Route } from "react-router-dom";
import Builder from "@/pages/builder/Builder";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/new" element={<Builder />} />
        <Route path="/project/:projectId" element={<Builder />} />
      </Routes>
    </BrowserRouter>
  );
}