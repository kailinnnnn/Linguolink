import api from "../../utils/firebaseApi";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useChatroomsStore from "../../zustand/ChatroomsStore";
import Chatroom from "./Chatroom";
import useVideoStore from "../../zustand/VideoStore";
const Chatrooms = () => {
  const { user } = useAuthStore();
  const { chatrooms } = useChatroomsStore();
  const [chatPartner, setChatPartner] = useState(null);
  const { isVideoOpen, setIsVideoOpen } = useVideoStore();
  const chatroomId = useParams().id;
  const timestampToTime = (timestamp) => {
    const date = timestamp?.toDate();

    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    };

    const formattedTime = new Intl.DateTimeFormat("default", options).format(
      date,
    );
    return formattedTime;
  };

  const sortedChatrooms = chatrooms?.sort((a, b) => {
    const aTime = a.messages[a.messages.length - 1]?.createdAt || new Date(0);
    const bTime = b.messages[b.messages.length - 1]?.createdAt || new Date(0);
    return bTime - aTime;
  });

  return (
    <div className=" flex h-full max-h-full w-[calc(100%)]  bg-white pl-24">
      {chatrooms && (
        <div className="  h-screen w-[calc(27.5%)] min-w-[calc(27.5%)]  max-w-[calc(27.5%)] grow-0 gap-5  bg-gray100  ">
          <h1 className=" mx-6 mb-5 mt-7 w-full pl-2 text-2xl font-semibold text-black ">
            Chats
          </h1>

          <input
            type="text"
            placeholder="     Search member or topic"
            className=" mx-6 mb-3 h-12  w-[calc(100%-48px)] rounded-xl bg-white"
          />

          <div className=" flex max-h-[calc(100%-128px)] w-full flex-grow flex-col overflow-auto overflow-y-auto">
            {sortedChatrooms.map((chatroom, i) => {
              const chatPartner = chatroom.participants.find(
                (participant) => participant.id !== user.id,
              );
              const createdAt = timestampToTime(
                chatroom.messages[chatroom.messages.length - 1]?.createdAt,
              );

              return (
                <Link
                  className={`flex h-fit items-center px-6 py-4 ${
                    chatroom.id === chatroomId && "bg-gray300"
                  } `}
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

                  <div className="w-full flex-col">
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
                        {chatroom.messages[chatroom.messages.length - 1]
                          ?.content !== "" &&
                        chatroom.messages[chatroom.messages.length - 1]
                          ?.content !== null
                          ? chatroom.messages[chatroom.messages.length - 1]
                              ?.content
                          : chatroom.messages[chatroom.messages.length - 1]
                                ?.comment !== "" &&
                              chatroom.messages[chatroom.messages.length - 1]
                                ?.comment !== null
                            ? chatroom.messages[chatroom.messages.length - 1]
                                ?.comment
                            : chatroom.messages[chatroom.messages.length - 1]
                                ?.revised}
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
