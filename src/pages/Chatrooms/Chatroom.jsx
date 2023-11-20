import api from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";

const Chatroom = () => {
  const chatroomId = useParams().id;
  const { user } = useAuthStore();
  const [chatroomData, setChatroomData] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [isMenuOpenArray, setIsMenuOpenArray] = useState(
    Array(chatroomData?.messages?.length || 0).fill(false),
  );

  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messageRef = useRef();

  useEffect(() => {
    const unsubChatroom = api.listenChatroom(chatroomId, (chatroomData) => {
      setChatroomData(chatroomData);
    });

    return () => {
      unsubChatroom();
    };
  }, [chatroomId]);

  useEffect(() => {
    console.log(user);
    if (chatroomData) {
      const chatPartnerId = chatroomData.participants.find(
        (participantId) => participantId !== user.id,
      );
      api.getUser(chatPartnerId).then((chatPartner) => {
        setChatPartner(chatPartner);
        console.log(chatPartner);
      });
    }
  }, [chatroomData]);

  const handleSendMessage = async () => {
    console.log(chatPartner.id);
    await api.sendMessage(
      chatroomId,
      user.id,
      chatPartner.id,
      messageRef.current.value,
    );
  };

  const handleRevise = async () => {
    const newContent = prompt("請輸入新的訊息");
    await api.reviseMessage(chatroomId, user.id, newContent);
  };

  //   const handleRevise=(messageId)=>{

  //   }
  return (
    <div className="h-full w-full">
      <header className="fixed top-0 flex max-w-full">
        {chatPartner && <p className="mr-auto block">{chatPartner.name}</p>}{" "}
        <button>
          <i className="fa-solid fa-phone text-xl text-white"></i>
        </button>
        <button>
          <i className="fa-solid fa-video text-xl text-white"></i>
        </button>
        <button>
          <i className="fa-solid  fa-ellipsis-vertical text-xl text-white"></i>
        </button>
      </header>
      <div className="w-full">
        {chatroomData &&
          chatroomData.messages.map((message, index) => {
            const isCurrentUser = message.sender === user.id;
            const messageClass = isCurrentUser
              ? "bg-blue-500 text-white ml-auto"
              : "bg-gray-300 text-black";

            return (
              <div
                key={index}
                className={`mt-4 w-fit rounded p-2 ${messageClass} relative`}
                onClick={() => {
                  const newIsMenuOpenArray = [...isMenuOpenArray];
                  newIsMenuOpenArray[index] = !newIsMenuOpenArray[index];
                  setIsMenuOpenArray(newIsMenuOpenArray);
                  setSelectedMessage(message);
                }}
              >
                <div className="flex items-center">
                  <p>{message.content}</p>
                  {isMenuOpenArray[index] && (
                    <div className="absolute left-16 z-10 flex w-24 flex-col bg-gray-500 text-slate-200">
                      <button>複製</button>
                      <button onClick={() => setIsReviseOpen(!isReviseOpen)}>
                        修正
                      </button>
                      <button>回覆</button>
                      <button>翻譯</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        {isReviseOpen && (
          <div>
            <p>被點選的內容：{selectedMessage?.content}</p>
            <p>被點選的ID：{selectedMessage?.id}</p>
          </div>
        )}
      </div>
      <footer className="fixed bottom-0 mt-10 flex  items-center">
        <button>
          <i className="fa-solid fa-microphone text-xl text-white"></i>
        </button>
        <button>
          <i className="fa-solid fa-camera text-xl text-white"></i>
        </button>
        <button>
          <i className="fa-solid fa-image text-xl text-white"></i>
        </button>
        <input type="text" ref={messageRef} className="max-w-full flex-1" />
        <button onClick={handleSendMessage}>
          <i className="fa-solid fa-paper-plane text-xl text-white"></i>
        </button>
      </footer>
    </div>
  );
};

export default Chatroom;
