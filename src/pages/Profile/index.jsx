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
      const response = await api.getUser(userProfileId);
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
      const chatroomId = chatroom ? chatroom.id : null;
      if (chatroomId) {
        navigate(`/chatrooms/${chatroomId}`);
      } else {
        const response = await api.createChatroom(user.id, userProfileId);
        const updatedUser = await api.getUser(user.id);
        setUser(updatedUser);
        navigate(`/chatrooms/${response}`);
      }
    } else {
      alert("請先登入");
      navigate(`/signin`);
    }
  };

  return (
    userProfileData && (
      <div className="ml-28 ">
        <p>{userProfileData.name}</p>
        <p>{userProfileData.email}</p>
        <button className={buttonStyles} onClick={handleOpenChatroom}>
          <i className="fa-solid fa-comment text-xl text-white "></i>
        </button>
      </div>
    )
  );
};

export default Profile;
