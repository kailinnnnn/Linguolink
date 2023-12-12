import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Signin from "./pages/Signin/index.jsx";
import Community from "./pages/Community/index.jsx";
import Profile from "./pages/Profile/index.jsx";
import Chatrooms from "./pages/Chatrooms/index.jsx";
import Chatroom from "./pages/Chatrooms/Chatroom.jsx";
import Learning from "./pages/Learning/index.jsx";
import MemberInfo from "./pages/Community/MemberInfo.jsx";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="signin" element={<Signin />} />
        <Route path="community" element={<Community />} />
        <Route path="community/:id" element={<MemberInfo />} />
        <Route path="chatrooms" element={<Chatrooms />}>
          <Route path=":id" element={<Chatroom />} />
        </Route>
        <Route path="learning" element={<Learning />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="*" element={<Navigate to="signin" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>,
);
