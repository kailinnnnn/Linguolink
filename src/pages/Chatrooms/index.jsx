import api from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

// async listenChatrooms(userId, callback) {
//   try {
//     const q = query(
//       collection(db, "users", userId, "chatrooms"),
//       where("participants", "array-contains", userId),
//     );
//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const chatrooms = querySnapshot.docs.map((doc) => {
//         return {
//           id: doc.id,
//           ...doc.data(),
//         };
//       });
//       callback(chatrooms);
//     });
//     return unsubscribe;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// },
