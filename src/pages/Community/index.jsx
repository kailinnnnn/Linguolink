import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/firebaseApi";
import MembersMap from "./MembersMap";

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
    <div className="ml-28 max-h-full ">
      <header className="fixed top-0 z-50 h-8 w-full bg-white">
        <button onClick={() => setShowPage("allMembers")}>All Members</button>
        <button onClick={() => setShowPage("map")}>Travel</button>
      </header>
      \
      {showPage === "allMembers" ? (
        <div className="flex">
          {members.map((member, index) => {
            return (
              <Link
                key={index}
                to={`/community/${member.id}`}
                state={{ member }}
                className="mt-8 flex"
              >
                <img src={member.profilePicture} alt="" className="h-36 w-36" />
                <div>
                  <p>{member.name}</p>
                  <i className="fa-solid fa-quote-right text-gray"></i>
                  <p>{member.age}</p>
                  <p>{member?.mainTopic}</p>
                  <div>
                    <p>Speak</p>
                    <p>{member.nativeLanguage}</p>
                    <p>Learning</p>
                    <p>{member.learningLanguage.learningLanguage}</p>
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
