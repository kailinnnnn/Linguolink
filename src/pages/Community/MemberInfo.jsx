import api from "../../utils/firebaseApi";
import googleMapApi from "../../utils/googleMapApi";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useChatroomsStore from "../../zustand/ChatroomsStore";

const buttonStyles = "rounded-full bg-gray-300 w-8 h-8";

const MemberInfo = () => {
  const userProfileId = useParams().id;
  const { user, setUser } = useAuthStore();
  const { chatrooms } = useChatroomsStore();
  const [member, setMember] = useState(null);
  const [locationText, setLocationText] = useState("");
  const navigate = useNavigate();
  const styleMappings = {
    meetings: { text: "In-Person Meetings", icon: "fa-solid fa-coffee" },
    textAndVoice: {
      text: "Text and Voice Messages",
      icon: "fa-solid fa-comment",
    },
    voiceAndVideo: { text: "Voice or Video Calls", icon: "fa-solid fa-video" },
  };

  useEffect(() => {
    async function getMember() {
      const response = await api.getUser(userProfileId);
      setMember(response);
    }
    getMember();
  }, []);

  useEffect(() => {
    const getLocation = () => {
      const { latitude, longitude } = member.location;
      googleMapApi.getLocation(latitude, longitude).then((location) => {
        setLocationText(location);
      });
    };
    member && getLocation();
    console.log(member);
  }, [member]);

  const handleOpenChatroom = async () => {
    if (user) {
      const chatroom = chatrooms?.find(
        (chatroom) =>
          chatroom.participants.some(
            (participant) => participant.id === member.id,
          ) && chatroom.participants.length === 2,
      );
      if (chatroom) {
        navigate(`/chatrooms/${chatroom.id}`);
      } else {
        const newChatroomId = await api.createChatroom(
          { id: user.id, name: user.name, profilePicture: user.profilePicture },
          {
            id: member.id,
            name: member.name,
            profilePicture: member.profilePicture,
          },
        );
        const updatedUser = await api.getUser(user.id);
        setUser(updatedUser);
        navigate(`/chatrooms/${newChatroomId}`);
      }
    } else {
      alert("請先登入");
      navigate(`/signin`);
    }
  };

  return (
    member && (
      <div className="ml-28 ">
        <img src="" alt="" />
        <img src={member.profilePicture} className="h-32 w-32" alt="" />
        <p>
          {member.name},{member.age}
        </p>
        <button className={buttonStyles} onClick={handleOpenChatroom}>
          <i className="fa-solid fa-comment text-xl text-white "></i>
          Message
        </button>
        <div>
          <div>
            <p>Language</p>
            <p>Native Language</p>
            <p>{member.nativeLanguage}</p>
            <p>Also Speak</p>
            <p>{member.alsoSpeak}</p>
            <p>Learning</p>
            <p>{member.learningLanguage.learningLanguage}</p>
            <div />
            <div />
            <div />
          </div>
        </div>
        <div>
          <p>About {member.name}</p>
          <p>{`${locationText.country},${locationText.city}`}</p>
          <p>What topics would you like to chat about?</p>
          <p>{member.topic}</p>
          <p>
            What qualities do you look for in a suitable LinguoLink partner?
          </p>
          <p>{member.partnerQualities}</p>
          <p>What are your language learning goals?</p>
          <p>member.goals</p>
        </div>
        <div>
          <p>Main Topic</p>
          <p>{member.mainTopic}</p>
        </div>
        <div>
          <p>Evaluate</p>
        </div>
        <div>
          <p>Learning Preferences</p>
          {Object.entries(user.communicationStyle).map(([style, value]) => {
            return (
              value && (
                <p key={style}>
                  <i className={styleMappings[style].icon}></i>
                  {styleMappings[style].text}
                </p>
              )
            );
          })}
        </div>
      </div>
    )
  );
};

export default MemberInfo;
