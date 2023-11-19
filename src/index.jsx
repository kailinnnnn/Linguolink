import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Signin from "./pages/Signin/index.jsx";
import Community from "./pages/Community/index.jsx";
import Profile from "./pages/Profile/index.jsx";
import Chatrooms from "./pages/Chatrooms/index.jsx";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="signin" element={<Signin />} />
          <Route path="community" element={<Community />} />
          <Route path="chatrooms/:id" element={<Chatrooms />} />
          <Route path="user/:id" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </>,
);
