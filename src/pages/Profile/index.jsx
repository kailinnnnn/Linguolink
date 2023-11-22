import api from "../../utils/firebaseApi";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useChatroomsStore from "../../zustand/ChatroomsStore";

const buttonStyles = "rounded-full bg-gray-300 w-8 h-8";
const Profile = () => {
  const userProfileId = useParams().id;
  const { setUser, logout, user } = useAuthStore();
  const { chatrooms, setChatrooms } = useChatroomsStore();
  const [userProfileData, setUserProfileData] = useState({});

  const navigate = useNavigate();
  useEffect(() => {
    async function getUser() {
      console.log(userProfileId);
      const response = await api.getUser(userProfileId);
      console.log(response);
      setUserProfileData(response);
    }
    getUser();
  }, []);

  const handleOpenChatroom = async () => {
    if (user) {
      const chatroom = chatrooms?.find(
        (chatroom) =>
          chatroom.participants.some((userId) => userId === userProfileId) &&
          chatroom.participants.length === 2,
      );
      console.log(chatroom);
      const chatroomId = chatroom ? chatroom.id : null;
      if (chatroomId) {
        console.log(1);
        navigate(`/chatrooms/${chatroomId}`);
      } else {
        console.log(2);

        const response = await api.createChatroom(user.id, userProfileId);
        const updatedUser = await api.getUser(user.id);
        setUser(updatedUser);
        console.log(response);
        navigate(`/chatrooms/${response}`);
      }
    } else {
      alert("請先登入");
      navigate(`/signin`);
    }
  };

  return (
    userProfileData && (
      <div>
        <p>{userProfileData.name}</p>
        <p>{userProfileData.email}</p>
        <button className={buttonStyles} onClick={handleOpenChatroom}>
          <i className="fa-solid fa-comment text-xl text-white"></i>
        </button>
      </div>
    )
  );
};
//按下icon 會觸發點擊事件
//該事件會
//查看使用者資料中有沒有與該用戶的聊天室
//如果沒有就呼叫api創建一個新的聊天室 並返回聊天室id及轉到該聊天室
//如果有就直接轉到該聊天室

export default Profile;
