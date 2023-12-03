import { Outlet } from "react-router-dom";
import api from "./utils/firebaseApi";
import { useEffect } from "react";
import Sidebar from "./component/Sidebar";
import useAuthStore from "./zustand/AuthStore";
import useChatroomsStore from "./zustand/ChatroomsStore";
import useWebRTCStore from "./zustand/webRTCStore";
import { NextUIProvider } from "@nextui-org/react";

function App() {
  const { user, login } = useAuthStore();
  const { setChatrooms } = useChatroomsStore();
  const { webRTCInfo, setWebRTCInfo } = useWebRTCStore();

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
      const unsubChatrooms = api.listenWebRTC(user.id, (webRTCData) => {
        setWebRTCInfo(webRTCData);
      });

      return () => {
        unsubChatrooms;
      };
    }
  }, [user]);

  useEffect(() => {
    localStorage.getItem("user") &&
      login(JSON.parse(localStorage.getItem("user")));
  }, []);

  useEffect(() => {
    console.log(webRTCInfo);
  }, [webRTCInfo]);

  return (
    <NextUIProvider>
      <div className="text-foreground bg-background light flex min-h-screen ">
        <Sidebar />
        <Outlet />
      </div>
    </NextUIProvider>
  );
}

export default App;
