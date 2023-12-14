import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/firebaseApi";
import MembersMap from "./MembersMap";
import useAuthStore from "../../zustand/AuthStore";

const Community = () => {
  const [members, setMembers] = useState([]);
  const [showPage, setShowPage] = useState("allMembers");
  const [scrollPosition, setScrollPosition] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    async function getAllMembers() {
      const response = await api.getAllMembers();
      setMembers(response);
    }
    getAllMembers();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    members.filter((member) => {
      console.log(member);
      if (member.location == {}) {
        return member;
      }
    });
  }, [members]);

  return (
    <div
      className={`ml-24 min-h-full w-[calc(100%-6rem)] bg-gray100   ${
        showPage === "allMembers" && "p-10"
      }
      `}
    >
      <header
        className={`fixed top-0 z-50 flex w-full  flex-wrap   py-6 ${
          showPage === "allMembers"
            ? scrollPosition > 0
              ? "bg-gray100"
              : "border-b-2 border-gray300 bg-gray100"
            : " items-center pl-10"
        }`}
      >
        {showPage === "allMembers" && scrollPosition === 0 && (
          <h1 className={` mb-3 w-full pl-2 text-2xl font-semibold text-black`}>
            Community
          </h1>
        )}

        <div
          className={`flex items-center justify-center ${
            scrollPosition > 0 && showPage === "allMembers" && "mt-2"
          }`}
        >
          <button
            onClick={() => setShowPage("allMembers")}
            className={`${
              showPage === "allMembers"
                ? "border-purple500 bg-purple500 text-white"
                : "border-gray100 bg-gray100 text-gray500 shadow"
            }  mr-2 h-10 w-fit rounded-full border-2 px-6 py-[0.35rem] `}
          >
            <p className="pb-px"> All Members</p>
          </button>
          <button
            onClick={() => setShowPage("travel")}
            className={`${
              showPage === "travel"
                ? "border-purple500 bg-purple500 text-white shadow"
                : "border-gray500 text-gray500 "
            }  mr-2 h-10 w-fit rounded-full border-2 px-6 py-[0.35rem]`}
          >
            <p className="pb-px">Travel</p>
          </button>
          <input
            type="text"
            placeholder="     Search member or topic"
            className={`${
              showPage === "travel" ? "shadow" : ""
            }  text-gray ml-auto h-10 w-72 rounded-full bg-white`}
          />
        </div>
      </header>

      {showPage === "allMembers" ? (
        <div
          className={`${scrollPosition === 0 ? "mt-[92px]" : "mt-10"} flex 
        flex-wrap  gap-5 pt-6`}
        >
          {members.map((member, index) => {
            if (member.id !== user.id) {
              return (
                <Link
                  key={index}
                  to={`/community/${member?.id}`}
                  state={{ member }}
                  className="flex h-fit w-[calc(49%)] rounded-2xl bg-white p-4 "
                >
                  <div className="mr-4 h-36 min-h-fit w-36 min-w-fit overflow-visible rounded-xl">
                    <img
                      src={member?.profilePicture}
                      alt=""
                      className="h-36 w-36 rounded-xl object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="">
                      <p className="font-semibold text-black">{member?.name}</p>
                      <i className="fa-solid fa-quote-right text-main"></i>
                    </div>

                    <p className="leading-6 text-black">{member?.age}</p>

                    <div className="h-12 w-full overflow-hidden ">
                      {" "}
                      <p className=" overflow-ellipsis leading-6 text-black">
                        {member?.mainTopic}
                      </p>
                    </div>
                    <div className="mb-1 mt-auto">
                      <small className="pr-2 text-xs font-semibold">
                        Speak
                      </small>
                      <small className="pr-2 text-xs">
                        {member?.nativeLanguage}
                      </small>

                      <small className="pr-2 text-xs font-semibold">
                        Learning
                      </small>
                      <small className="pr-2 text-xs">
                        {member?.learningLanguage?.learningLanguage}
                      </small>
                    </div>
                  </div>
                </Link>
              );
            }
          })}
        </div>
      ) : (
        <MembersMap members={members} />
      )}
    </div>
  );
};

export default Community;
