import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/firebaseApi";
import MembersMap from "./MembersMap";
import { Input } from "@nextui-org/react";

const Community = () => {
  const [members, setMembers] = useState([]);
  const [showPage, setShowPage] = useState("allMembers");
  useEffect(() => {
    async function getAllMembers() {
      const response = await api.getAllMembers();
      setMembers(response);
    }
    getAllMembers();
  }, []);

  return (
    <div
      className={`bg-gray100 ml-24 min-h-full w-[calc(100%-6rem)]  ${
        showPage === "allMembers" ? "p-10" : ""
      }`}
    >
      <header
        className={`fixed top-0 z-50 mt-6 flex  w-full  flex-wrap ${
          showPage === "allMembers" ? "h-24" : " items-center pb-6 pl-10"
        }`}
      >
        {showPage === "allMembers" && (
          <h1 className={`mb-4 w-full pl-2 text-2xl font-semibold  text-black`}>
            Community
          </h1>
        )}

        <div className="flex items-center justify-center">
          <button
            onClick={() => setShowPage("allMembers")}
            className={`${
              showPage === "allMembers"
                ? "bg-purple500 border-purple500 text-white"
                : "text-gray500 border-gray100 bg-gray100 "
            }  mr-2 h-10 w-fit rounded-full border-2 px-6 py-[0.35rem]`}
          >
            <p> All Members</p>
          </button>
          <button
            onClick={() => setShowPage("travel")}
            className={`${
              showPage === "travel"
                ? "bg-purple500 border-purple500 text-white"
                : "text-gray500 border-gray500 "
            }  mr-2 h-10 w-fit rounded-full border-2 px-6 py-[0.35rem]`}
          >
            <p>Travel</p>
          </button>
          <input
            type="text"
            placeholder="     Search member or topic"
            className="text-gray ml-auto h-11 w-72 rounded-full bg-white"
          />
        </div>
      </header>
      {showPage === "allMembers" && (
        <div
          className={`border-1 border-gray300  mt-24 
        w-full 
  `}
        />
      )}
      {showPage === "allMembers" ? (
        <div className="mt-5 flex flex-wrap gap-5">
          {members.map((member, index) => {
            return (
              <Link
                key={index}
                to={`/community/${member.id}`}
                state={{ member }}
                className="flex h-fit w-[calc(49%)] rounded-2xl bg-white p-4 "
              >
                <div className="mr-4 h-36 min-h-fit w-36 min-w-fit overflow-visible rounded-xl">
                  <img
                    src={member.profilePicture}
                    alt=""
                    className="h-36 w-36 rounded-xl object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="">
                    <p className="font-semibold text-black">{member.name}</p>
                    <i className="fa-solid fa-quote-right text-main"></i>
                  </div>

                  <p className="leading-6 text-black">{member.age}</p>

                  <div class="h-12 w-full overflow-hidden ">
                    {" "}
                    <p className=" overflow-ellipsis leading-6 text-black">
                      {member?.mainTopic}
                    </p>
                  </div>
                  <div className="mb-1 mt-auto">
                    <small className="pr-2 text-xs font-semibold">Speak</small>
                    <small className="pr-2 text-xs">
                      {member.nativeLanguage}
                    </small>

                    <small className="pr-2 text-xs font-semibold">
                      Learning
                    </small>
                    <small className="pr-2 text-xs">
                      {member.learningLanguage.learningLanguage}
                    </small>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <MembersMap members={members} />
      )}
    </div>
  );
};

export default Community;
