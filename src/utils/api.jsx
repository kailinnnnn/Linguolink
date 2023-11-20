import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  getFirestore,
  addDoc,
  setDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANqrKFKCcw703az118cdvb3zSRZxvD12s",
  authDomain: "linguolink-e84b0.firebaseapp.com",
  projectId: "linguolink-e84b0",
  storageBucket: "linguolink-e84b0.appspot.com",
  messagingSenderId: "1010848626345",
  appId: "1:1010848626345:web:b5357485b6995950a89bb8",
  measurementId: "G-GXXL4BFS8E",
};
const provider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const api = {
  //要把登入與註冊的api分開，然後要抓userid
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const newUser = {
        name: user.displayName,
        email: user.email,
      };

      if (docSnap.exists()) {
        console.log("已註冊");
      } else {
        await setDoc(userRef, newUser);
      }
      console.log(newUser);
      return newUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async nativeRegister(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);
      const userData = {
        name: name,
        email: email,
      };
      await setDoc(userRef, userData);
      console.log("新用戶已成功創建");
    } catch (error) {
      console.error("創建新用戶時發生錯誤", error);
      throw error;
    }
  },

  async nativeSignin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const userData = docSnap.data();
      userData.id = docSnap.id;
      // const chatrooms = userData?.chatrooms;
      // const chatroomsData = chatrooms
      //   ? await Promise.all(
      //       chatrooms.map(async (chatroom) => {
      //         const chatroomRef = doc(db, "chatrooms", chatroom.id);
      //         const chatroomSnapshot = await getDoc(chatroomRef);
      //         if (chatroomSnapshot.exists()) {
      //           const chatroomData = chatroomSnapshot.data();
      //           return {
      //             ...chatroomData,
      //             participants: chatroom.participants,
      //             id: chatroomSnapshot.id,
      //           };
      //         } else {
      //           return null;
      //         }
      //       }),
      //     )
      //   : [];
      // userData.chatrooms = chatroomsData;
      // 返回包含用户ID的对象
      return userData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const userCol = collection(db, "users");
      const userSnapshot = await getDocs(userCol);
      const userList = userSnapshot.docs.map((doc) => {
        // 在每个用户数据中包含文档的 ID
        return {
          userId: doc.id,
          userData: doc.data(),
        };
      });

      return userList;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async getUser(id) {
    try {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      userData.id = userSnap.id;
      return userData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async createChatroom(userId, targetUserId) {
    try {
      const chatroomRef = collection(db, "chatrooms");
      const newChatroomRef = await addDoc(chatroomRef, {
        participants: [userId, targetUserId],
        createBy: userId,
        createdAt: serverTimestamp(),
        messages: [],
      });

      const newChatroomId = newChatroomRef.id;
      const userChatroomsRef = collection(db, "users", userId, "chatrooms");
      await addDoc(userChatroomsRef, {
        id: newChatroomId,
        participants: [userId, targetUserId],
        createBy: userId,
        createdAt: serverTimestamp(),
        messages: [],
      });

      const targetUserChatroomsRef = collection(
        db,
        "users",
        targetUserId,
        "chatrooms",
      );
      await addDoc(targetUserChatroomsRef, {
        id: newChatroomId,
        participants: [userId, targetUserId],
        createBy: userId,
        createdAt: serverTimestamp(),
        messages: [],
      });
      return newChatroomId;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  //Listen to the user's chatrooms sub-collection
  async listenChatrooms(userId, callback) {
    const userChatroomsRef = collection(db, "users", userId, "chatrooms");
    const unsubscribe = onSnapshot(userChatroomsRef, (querySnapshot) => {
      const userChatrooms = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      callback(userChatrooms);
    });

    return unsubscribe;
  },

  // async getChatrooms(userId) {
  //   try {
  //     const userRef = doc(db, "user", userId);
  //     const userSnap = await getDoc(userRef);
  //     const userData = userSnap.data();
  //     userData.id = userSnap.id;
  //     return userData.chatrooms;
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // },
  // async listenChatrooms(userId, callback) {
  //   try {
  //     const q = query(
  //       collection(db, "chatroom"),
  //       where("participants", "array-contains", userId),
  //     );
  //     const userRef = doc(db, "user", userId);
  //     const userSnap = await getDoc(userRef);
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
  async getChatroom(id) {
    try {
      const chatroomRef = doc(db, "chatroom", id);
      const chatroomSnap = await getDoc(chatroomRef);
      const chatroomData = chatroomSnap.data();
      chatroomData.id = chatroomSnap.id;
      return chatroomData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async sendMessage(chatroomId, userId, targetUserId, content) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomId);

      await updateDoc(chatroomRef, {
        messages: arrayUnion({
          content: content,
          sender: userId,
          createdAt: new Date(),
        }),
      });
      const userChatroomsRef = collection(db, "users", userId, "chatrooms");
      const queryUserChatroomsRef = query(
        userChatroomsRef,
        where("id", "==", chatroomId),
      );
      const queryUserChatroomsSnapshot = await getDocs(queryUserChatroomsRef);
      const userChatroomDoc = queryUserChatroomsSnapshot.docs[0];
      const userChatroomRef = doc(
        db,
        "users",
        userId,
        "chatrooms",
        userChatroomDoc.ref.id,
      );
      await updateDoc(userChatroomRef, {
        messages: arrayUnion({
          content: content,
          sender: userId,
          createdAt: new Date(),
        }),
      });
      const targetUserChatroomsRef = collection(
        db,
        "users",
        targetUserId,
        "chatrooms",
      );
      const querytargetUserChatroomsRef = query(
        targetUserChatroomsRef,
        where("id", "==", chatroomId),
      );
      const querytargetUserChatroomsSnapshot = await getDocs(
        querytargetUserChatroomsRef,
      );
      const targetUserChatroomDoc = querytargetUserChatroomsSnapshot.docs[0];
      const targetUserChatroomRef = doc(
        db,
        "users",
        targetUserId,
        "chatrooms",
        targetUserChatroomDoc.ref.id,
      );
      await updateDoc(targetUserChatroomRef, {
        messages: arrayUnion({
          content: content,
          sender: userId,
          createdAt: new Date(),
        }),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  //監聽聊天室資料庫
  async listenChatroom(chatroomId, callback) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomId);
      const unsubscribe = onSnapshot(chatroomRef, (doc) => {
        const chatroomData = doc.data();
        chatroomData.id = doc.id;
        callback(chatroomData);
      });
      return unsubscribe;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export default api;
