import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Profile from "./pages/Profile/index.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </>,
);
