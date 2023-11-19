import api from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import MessageList from "./MessageList";

const Chatroom = () => {
  const chatroomId = useParams().id;
  const { setUser, logout, user } = useAuthStore();
  const [chatroomData, setChatroomData] = useState(null);
  const messageRef = useRef();
  useEffect(() => {
    async function getChatroom() {
      const response = await api.getChatroom(chatroomId);
      console.log(response);
    }
    getChatroom();
  }, []);

  useEffect(() => {
    const unsubscribe = api.listenChatroom(chatroomId, (chatroomData) => {
      setChatroomData(chatroomData);
    });

    return () => {
      unsubscribe();
    };
  }, [chatroomId]);

  const handleSendMessage = async () => {
    await api.sendMessage(chatroomId, user.id, messageRef.current.value);
  };
  return (
    <div>
      <div className="w-full">
        {chatroomData &&
          chatroomData.messages.map((message, index) => {
            const isCurrentUser = message.sender === user.id;

            // 根據發送者是否為當前用戶，設定不同的樣式
            const messageClass = isCurrentUser
              ? "bg-blue-500 text-white ml-auto"
              : "bg-gray-300 text-black";

            return (
              <div
                key={index}
                className={`mt-4 w-fit rounded p-2 ${messageClass}`}
              >
                <p>{message.content}</p>
              </div>
            );
          })}
      </div>
      <div className="mt-10 flex w-full flex-nowrap">
        <input type="text" ref={messageRef} className=" w-full" />
        <button onClick={handleSendMessage}>
          <i className="fa-solid fa-paper-plane text-xl text-white"></i>
        </button>
      </div>
    </div>
  );
};

export default Chatroom;
