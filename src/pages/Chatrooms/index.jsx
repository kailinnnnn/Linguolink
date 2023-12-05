import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useChatroomsStore from "../../zustand/ChatroomsStore";
import Chatroom from "./Chatroom";
const Chatrooms = () => {
  const { user } = useAuthStore();
  const { chatrooms } = useChatroomsStore();
  const [chatPartner, setChatPartner] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    console.log(chatrooms);
    console.log(chatPartner);
  }, []);

  const timestampToTime = (timestamp) => {
    const date = timestamp.toDate();

    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: false, // 使用 24 小時制
    };

    const formattedTime = new Intl.DateTimeFormat("default", options).format(
      date,
    );
    return formattedTime;
  };

  return (
    <div className=" flex w-full bg-white pl-24">
      {chatrooms && (
        <div className="bg-gray100  h-screen w-1/4  min-w-fit max-w-[25%] grow-0 gap-5 p-6">
          <h1 className=" mb-5 mt-1 w-full pl-2 text-2xl font-semibold text-black">
            Chats
          </h1>

          <input
            type="text"
            placeholder="     Search member or topic"
            className=" mb-7 ml-auto h-12 w-full rounded-xl bg-white"
          />

          <div className="flex w-full flex-col ">
            {chatrooms.map((chatroom) => {
              const chatPartner = chatroom.participants.find(
                (participant) => participant.id !== user.id,
              );
              const createdAt = timestampToTime(
                chatroom.messages[chatroom.messages.length - 1]?.createdAt,
              );

              return (
                <Link
                  className="mb-5 flex h-fit items-center "
                  to={`/chatrooms/${chatroom.id}`}
                  onClick={() => {
                    setChatPartner(chatPartner);
                  }}
                >
                  <div className="mr-4  flex h-16 min-h-fit w-16 min-w-fit items-center overflow-visible rounded-full border-white">
                    <img
                      src={chatPartner.profilePicture}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-col">
                    <div className="mb-1 flex items-center justify-between">
                      <p className=" whitespace-nowrap pr-3 font-semibold uppercase">
                        {chatPartner.name}
                      </p>
                      <p className="text-gray500  ml-auto flex ">{createdAt}</p>
                    </div>
                    <div class="h-5 w-60 overflow-hidden ">
                      <p class="text-gray500 overflow-hidden overflow-ellipsis whitespace-normal ">
                        {
                          chatroom.messages[chatroom.messages.length - 1]
                            .content
                        }
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <Chatroom
        chatPartner={chatPartner}
        setChatPartner={setChatPartner}
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
      />
    </div>
  );
};

export default Chatrooms;
