import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useChatroomsStore from "../../zustand/ChatroomsStore";
const MessageList = () => {
  const { user } = useAuthStore();
  const { chatrooms } = useChatroomsStore();

  return (
    <div className="fixed flex w-28 flex-col items-center  gap-4 p-6 ">
      Chats
      {chatrooms &&
        chatrooms.map((chatroom, index) => {
          return (
            <Link
              key={index}
              className="h-16 w-16 rounded-full bg-gray-300"
              to={`/chatrooms/${chatroom.id}`}
            ></Link>
          );
        })}
    </div>
  );
};

export default MessageList;
