import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { useParams, Link } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useChatroomsStore from "../../zustand/ChatroomsStore";
const Chatrooms = () => {
  const { user } = useAuthStore();
  const { chatrooms } = useChatroomsStore();

  useEffect(() => {
    console.log(chatrooms);
  }, []);

  const timestampToTime = (timestamp) => {
    const date = timestamp.toDate().toLocaleTimeString();
    return date;
  };

  return (
    <div className="ml-28  h-screen w-full">
      <h1>Chats</h1>
      <div className="flex">
        {chatrooms.map((chatroom) => {
          const chatPartner = chatroom.participants.find(
            (participant) => participant.id !== user.id,
          );
          const createdAt = timestampToTime(
            chatroom.messages[chatroom.messages.length - 1].createdAt,
          );
          console.log(chatroom.id);
          return (
            <Link to={`/chatrooms/${chatroom.id}`}>
              <Card className="flex py-4">
                <CardBody className="w-10 overflow-visible py-2">
                  <Image
                    alt="Card background"
                    className="rounded-xl object-cover"
                    src={chatPartner.profilePicture}
                    width={270}
                  />
                </CardBody>
                <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                  <p className="text-tiny font-bold uppercase">
                    {chatPartner.name}
                  </p>
                  <small className="text-default-500">
                    {chatroom.messages[chatroom.messages.length - 1].content}
                  </small>
                  <small className="text-default-500"> {createdAt}</small>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Chatrooms;
