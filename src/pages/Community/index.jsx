import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/firebaseApi";
import MembersMap from "./map";

const Community = () => {
  const [members, setMembers] = useState([]);
  const [showPage, setShowPage] = useState("allMembers");
  useEffect(() => {
    //React 中的 useEffect 钩子不直接支持使用异步函数。由于 async 函数返回一个 Promise，因此你的 useEffect 返回了一个 Promise，这是不被允许的。
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
      {showPage === "allMembers" ? (
        members.map((member, index) => {
          return (
            <Link
              key={index}
              to={`/profile/${member.id}`}
              state={{ member }}
              className="mt-8 block"
            >
              <p>{member.name}</p>
              <p>{member.email}</p>
            </Link>
          );
        })
      ) : (
        <MembersMap members={members} />
      )}
    </div>
  );
};

export default Community;
