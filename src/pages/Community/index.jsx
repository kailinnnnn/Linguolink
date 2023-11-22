import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/firebaseApi";

const Community = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    //React 中的 useEffect 钩子不直接支持使用异步函数。由于 async 函数返回一个 Promise，因此你的 useEffect 返回了一个 Promise，这是不被允许的。
    async function getAllUsers() {
      const response = await api.getAllUsers();
      setUsers(response);
    }
    getAllUsers();
  }, []);
  return (
    <div>
      {users &&
        users.map((user, index) => {
          return (
            <Link
              key={index}
              to={`/user/${user.userId}`}
              state={{ userData: user.userData }}
            >
              <p>{user.userData.name}</p>
              <p>{user.userData.email}</p>
            </Link>
          );
        })}
    </div>
  );
};

export default Community;
