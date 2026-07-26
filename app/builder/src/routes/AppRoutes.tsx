import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Builder from "../pages/builder/Builder";


<BrowserRouter>
    <Routes>
        <Route path="*" element={<Builder />} />
    </Routes>
</BrowserRouter>