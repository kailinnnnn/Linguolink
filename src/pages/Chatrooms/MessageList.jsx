import api from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";

const MessageList = () => {
  const { setUser, logout, user } = useAuthStore();
  const [chatrooms, setChatrooms] = useState([]);
  //   useEffect(() => {
  //     async function getChatrooms() {
  //       const response = await api.getChatrooms();
  //       setChatrooms(response);
  //     }
  //     getChatrooms();
  //   });
  //   useEffect(() => {
  //     const unsubscribe = api.listenChatrooms((chatrooms) => {
  //       setChatrooms(chatrooms);
  //     });
  //     return () => {
  //       unsubscribe();
  //     };
  //   });
  console.log(user);
  return (
    <div className="flex w-28 flex-col items-center gap-4  p-6 ">
      {user.chatrooms.map((chatroom, index) => {
        return (
          <div key={index} className="h-16 w-16 rounded-full bg-gray-300"></div>
        );
      })}
    </div>
  );
};

export default MessageList;
