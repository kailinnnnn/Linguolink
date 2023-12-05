import api from "../../utils/firebaseApi";
import googleMapApi from "../../utils/googleMapApi";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useChatroomsStore from "../../zustand/ChatroomsStore";
import profileMapImage from "./profileMap.avif";
import { Image } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";

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
      text: "Text and Voice",
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
      <div className="bg-gray100 wrap  ml-24 h-full w-full flex-wrap p-5">
        {/* <Image
          isBlurred
          width={240}
          src={profileMapImage}
          classNames="m-5 w-full"
        /> */}
        <div className="mb-5 flex flex-col rounded-xl bg-white">
          <div className="overflow-hidden rounded-t-xl">
            <img
              src={profileMapImage}
              alt=""
              className="rounded-t-xl object-cover"
            />
          </div>
          <div className="relative -top-16 z-10 ml-20 flex h-44">
            <div className="border-5 mr-8 h-36 min-h-fit w-36 min-w-fit overflow-visible rounded-full border-white">
              <img
                src={member.profilePicture}
                alt=""
                className="h-36 w-36 rounded-full object-cover"
              />
            </div>

            <div className="relative top-24 w-1/2  ">
              <p className="mb-3 text-3xl font-semibold">
                {member.name}
                {member.age}
              </p>
              <p className=" text-gray500 font-light leading-6">
                {member?.mainTopic}
              </p>
            </div>

            <button
              className="bg-purple100 relative right-10 top-24 ml-auto flex h-10 items-center justify-center rounded-xl p-3"
              onClick={handleOpenChatroom}
            >
              <i className="fa-solid fa-comment text-purple500 pr-2 text-xl"></i>
              <p className=" text-purple500 text-l "> Message</p>
            </button>
          </div>
        </div>

        <div className="flex h-full w-full flex-wrap justify-center gap-5">
          <div className="flex w-1/5 flex-col rounded-xl">
            {" "}
            <div className="mb-5 flex flex-col rounded-xl bg-white p-7">
              <p className="text-xl font-semibold">Language</p>
              <div className="border-1 border-gray300  mb-5 mt-4" />
              <small className="mb-1 whitespace-nowrap">Native Language</small>
              <p className="">{member.nativeLanguage}</p>
              <small className=" mb-1  mt-3">Also Speak</small>
              <p>{member.alsoSpeak}</p>
              <small className="mb-1 mt-3">Learning</small>
              <p>{member.learningLanguage.learningLanguage}</p>
            </div>
            <div className="flex w-full flex-col rounded-xl bg-white p-7">
              <p className="whitespace-nowrap text-xl font-semibold">
                Learning Preferences
              </p>
              <div className="border-1 border-gray300  mb-5 mt-4" />
              {Object.entries(user.communicationStyle).map(([style, value]) => {
                return (
                  value && (
                    <p key={style} className=" mb-1  mt-1 ">
                      <i
                        className={` ${styleMappings[style].icon} text-purple500 mr-2`}
                      ></i>
                      {styleMappings[style].text}
                    </p>
                  )
                );
              })}
            </div>
          </div>

          <div className="flex w-1/2 max-w-[50%] flex-col rounded-xl bg-white p-7 ">
            <p className="whitespace-nowrap text-xl font-semibold">
              About {member.name}
            </p>
            <div className="border-1 border-gray300  mb-5 mt-4" />
            <p className=" mb-1  ">{`${locationText.country},${locationText.city}`}</p>
            <p className=" mb-1  mt-3 font-semibold">
              What topics would you like to chat about?
            </p>
            <p className=" mb-1  mt-1 ">{member.aboutMe.topic}</p>
            <p className=" mb-1  mt-3  font-semibold ">
              What qualities do you look for in a suitable LinguoLink partner?
            </p>
            <p className=" mb-1  mt-1  ">{member.aboutMe.partnerQualities}</p>
            <p className=" mb-1  mt-3  font-semibold  ">
              What are your language learning goals?
            </p>

            <p className=" mb-1  mt-1">{member.aboutMe.goals}</p>
          </div>
          <div className="flex w-1/4 flex-col gap-5 rounded-xl">
            <div className="flex flex-col rounded-xl bg-white p-7">
              <p className="whitespace-nowrap text-xl font-semibold ">
                Main Topic
              </p>

              <div className="border-1 border-gray300  mb-5 mt-4" />
              <p className=" mb-1 ">{member.mainTopic}</p>
            </div>
            <div className="flex w-full flex-col rounded-xl bg-white p-7">
              <p className="whitespace-nowrap text-xl font-semibold">Photos</p>
              <div className="border-1 border-gray300  mb-5 mt-4 w-full" />
              {member.photos.map((photo) => {
                return (
                  photo.url !== "" && (
                    <div className="mb-8 h-36 min-h-fit w-full min-w-fit overflow-visible rounded-xl ">
                      <img
                        src={photo.url}
                        alt=""
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default MemberInfo;
