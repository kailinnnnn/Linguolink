import { Outlet } from "react-router-dom";
import api from "./utils/api";
import { useEffect } from "react";
import Sidebar from "./component/Sidebar";
import useAuthStore from "./zustand/AuthStore";
import useChatroomsStore from "./zustand/ChatroomsStore";
function App() {
  const { user } = useAuthStore();
  const { chatrooms, setChatrooms } = useChatroomsStore();
  useEffect(() => {
    console.log(user);
    if (user) {
      const unsubChatrooms = api.listenChatrooms(user.id, (chatrooms) => {
        console.log(chatrooms);
        setChatrooms(chatrooms);
      });

      return () => {
        unsubChatrooms();
      };
    }
  }, [user]);

  useEffect(() => {
    console.log(chatrooms);
  }, [chatrooms]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default App;
