import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useChatroomsStore from "../../zustand/ChatroomsStore";
import Chatroom from "./Chatroom";
import useVideoStore from "../../zustand/VideoStore";
const Chatrooms = () => {
  const { user } = useAuthStore();
  const { chatrooms } = useChatroomsStore();
  const [chatPartner, setChatPartner] = useState(null);
  const { isVideoOpen, setIsVideoOpen } = useVideoStore();

  const timestampToTime = (timestamp) => {
    const date = timestamp?.toDate();

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
    <div className=" flex h-full max-h-full w-[calc(100%)]  bg-white pl-24">
      {chatrooms && (
        <div className="  h-screen w-[calc(27.5%)] min-w-[calc(27.5%)]  max-w-[calc(27.5%)] grow-0 gap-5  bg-gray100  p-6">
          <h1 className=" mb-5 mt-1 w-full pl-2 text-2xl font-semibold text-black">
            Chats
          </h1>

          <input
            type="text"
            placeholder="     Search member or topic"
            className=" mb-7 ml-auto h-12 w-full rounded-xl bg-white"
          />

          <div className=" flex max-h-[calc(100%-128px)] w-full flex-grow flex-col overflow-auto overflow-y-auto">
            {chatrooms.map((chatroom, i) => {
              const chatPartner = chatroom.participants.find(
                (participant) => participant.id !== user.id,
              );
              const createdAt = timestampToTime(
                chatroom.messages[chatroom.messages.length - 1]?.createdAt,
              );

              return (
                <Link
                  className={`mb-5 flex h-fit items-center `}
                  to={`/chatrooms/${chatroom.id}`}
                  onClick={() => {
                    setChatPartner(chatPartner);
                  }}
                  key={i}
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
                      <small className="ml-auto  flex text-gray500 ">
                        {createdAt}
                      </small>
                    </div>
                    <div className="h-5 w-60 overflow-hidden ">
                      <p className="overflow-hidden overflow-ellipsis whitespace-normal text-gray500 ">
                        {
                          chatroom.messages[chatroom.messages.length - 1]
                            ?.content
                        }
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
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
                      <small className="ml-auto  flex text-gray500 ">
                        {createdAt}
                      </small>
                    </div>
                    <div className="h-5 w-60 overflow-hidden ">
                      <p className="overflow-hidden overflow-ellipsis whitespace-normal text-gray500 ">
                        {
                          chatroom.messages[chatroom.messages.length - 1]
                            ?.content
                        }
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
            {chatrooms.map((chatroom) => {
              const chatPartner = chatroom.participants.find(
                (participant) => participant.id !== user.id,
              );
              const createdAt = timestampToTime(
                chatroom.messages[chatroom.messages.length - 1]?.createdAt,
              );

              return (
                <Link
                  className="mb-5 flex h-fit items-center pr-2"
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
                      <small className="ml-auto  flex text-gray500 ">
                        {createdAt}
                      </small>
                    </div>
                    <div className="h-5 w-60 overflow-hidden ">
                      <p className="overflow-hidden overflow-ellipsis whitespace-normal text-gray500 ">
                        {
                          chatroom.messages[chatroom.messages.length - 1]
                            ?.content
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
