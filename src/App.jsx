import { Outlet } from "react-router-dom";
import api from "./utils/firebaseApi";
import { useEffect } from "react";
import Sidebar from "./component/Sidebar";
import useAuthStore from "./zustand/AuthStore";
import useChatroomsStore from "./zustand/ChatroomsStore";
import useWebRTCStore from "./zustand/webRTCStore";
import { NextUIProvider } from "@nextui-org/react";
import { Link, useNavigate } from "react-router-dom";
function App() {
  const { user, login, setUser, isLogin } = useAuthStore();
  const { setChatrooms } = useChatroomsStore();
  const { webRTCInfo, setWebRTCInfo } = useWebRTCStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      const unsubChatrooms = api.listenChatrooms(user.id, (chatrooms) => {
        setChatrooms(chatrooms);
      });

      return () => {
        unsubChatrooms;
      };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const unsubUser = api.listenUser(user.id, (user) => {
        setUser(user);
      });
      console.log("listenUser");
      return () => {
        unsubUser;
      };
    }
  }, [isLogin]);

  useEffect(() => {
    if (isLogin) {
      const unsubChatrooms = api.listenWebRTC(user.id, (webRTCData) => {
        setWebRTCInfo(webRTCData);
      });

      return () => {
        unsubChatrooms;
      };
    }
  }, [isLogin]);

  useEffect(() => {
    localStorage.getItem("user") &&
      login(JSON.parse(localStorage.getItem("user")));
  }, []);

  useEffect(() => {
    console.log("trigger WebRTC monitor", webRTCInfo);
  }, [webRTCInfo]);

  useEffect(() => {
    if (!user && !localStorage.getItem("user")) {
      navigate("/login");
    }
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     console.log(user.location);
  //   }
  // }, [user]);

  return (
    <NextUIProvider>
      <div className="flex min-h-screen w-full min-w-full bg-background text-foreground light">
        <Sidebar />
        <Outlet />
      </div>
    </NextUIProvider>
  );
}

export default App;
