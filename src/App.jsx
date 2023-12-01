import { Outlet } from "react-router-dom";
import api from "./utils/firebaseApi";
import { useEffect } from "react";
import Sidebar from "./component/Sidebar";
import useAuthStore from "./zustand/AuthStore";
import useChatroomsStore from "./zustand/ChatroomsStore";
import useWebRTCStore from "./zustand/webRTCStore";

function App() {
  const { user, setUser } = useAuthStore();
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
      setUser(JSON.parse(localStorage.getItem("user")));
  }, []);

  useEffect(() => {
    console.log(webRTCInfo);
  }, [webRTCInfo]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default App;
