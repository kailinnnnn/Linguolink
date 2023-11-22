import useAuthStore from "../../zustand/AuthStore";
import MessageList from "./MessageList";
import Chatroom from "./Chatroom";
const Chatrooms = () => {
  //處理非聊天室成員禁止訪問聊天室
  return (
    <div className="flex w-full">
      <MessageList />
      <Chatroom />
    </div>
  );
};

export default Chatrooms;
