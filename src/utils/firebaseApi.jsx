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
  deleteDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

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
const storage = getStorage();
const storageRef = ref(storage);

const api = {
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

      const userChatroomsRef = doc(
        db,
        "users",
        userId,
        "chatrooms",
        newChatroomId,
      );
      await setDoc(userChatroomsRef, {
        participants: [userId, targetUserId],
        createBy: userId,
        createdAt: serverTimestamp(),
        messages: [],
      });

      const targetUserChatroomsRef = doc(
        db,
        "users",
        targetUserId,
        "chatrooms",
        newChatroomId,
      );
      await setDoc(targetUserChatroomsRef, {
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
  /*
  為什麼不能這樣寫？
  async listenChatrooms(userId, callback) {
    const userChatroomsRef = collection(db, "users", userId, "chatrooms");
    return onSnapshot(userChatroomsRef, (querySnapshot) => {
      console.log("Monitoring chatrooms");
      const userChatrooms = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      callback(userChatrooms);
    });
  },*/
  async listenChatrooms(userId, callback) {
    const userChatroomsRef = collection(db, "users", userId, "chatrooms");
    const unsubChatrooms = onSnapshot(userChatroomsRef, (querySnapshot) => {
      const userChatrooms = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      callback(userChatrooms);
    });
    return unsubChatrooms;
  },

  async listenWebRTC(userId, callback) {
    const userChatroomsRef = collection(db, "users", userId, "chatrooms");
    const unsubWebRTCsArr = [];
    console.log(userChatroomsRef);
    const unsubChatrooms = onSnapshot(
      userChatroomsRef,
      async (querySnapshot) => {
        console.log("trigger Chatrooms monitor"); // webrtc有新寫入時，不會console.log(1)，得證子集和變化不會觸發母集的onSnapshot

        querySnapshot.docs.map(async (doc) => {
          const webRTCRef = collection(doc.ref, "webrtc");

          const unsubWebRTC = onSnapshot(webRTCRef, (webRtcSnapshot) => {
            console.log("trigger WebRTC monitor");
            const chatroomWebRTCData = {};
            webRtcSnapshot.forEach((doc) => {
              chatroomWebRTCData[doc.id] = doc.data();
            });
            if (JSON.stringify(chatroomWebRTCData) !== "{}") {
              callback([chatroomWebRTCData]);
            }

            unsubWebRTCsArr.push(unsubWebRTC);
          });
        });
      },
    );

    return () => {
      unsubChatrooms;
      unsubWebRTCsArr.forEach((unsubWebRTC) => unsubWebRTC);
    };
  },

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
  async sendMessage(
    chatroomId,
    userId,
    targetUserId,
    content,
    toReviseSent,
    revised,
    comment,
    imageUrl,
    recordUrl,
  ) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomId);

      await updateDoc(chatroomRef, {
        messages: arrayUnion({
          content: content,
          sender: userId,
          createdAt: new Date(),
          toReviseSent: toReviseSent ? toReviseSent : null,
          revised: revised ? revised : null,
          comment: comment ? comment : null,
          imageUrl: imageUrl ? imageUrl : null,
          recordUrl: recordUrl ? recordUrl : null,
        }),
      });
      const userChatroomRef = doc(db, "users", userId, "chatrooms", chatroomId);

      await updateDoc(userChatroomRef, {
        messages: arrayUnion({
          content: content,
          sender: userId,
          createdAt: new Date(),
          toReviseSent: toReviseSent ? toReviseSent : null,
          revised: revised ? revised : null,
          comment: comment ? comment : null,
          imageUrl: imageUrl ? imageUrl : null,
          recordUrl: recordUrl ? recordUrl : null,
        }),
      });
      const targetUserChatroomRef = doc(
        db,
        "users",
        targetUserId,
        "chatrooms",
        chatroomId,
      );

      await updateDoc(targetUserChatroomRef, {
        messages: arrayUnion({
          content: content,
          sender: userId,
          createdAt: new Date(),
          toReviseSent: toReviseSent ? toReviseSent : null,
          revised: revised ? revised : null,
          comment: comment ? comment : null,
          imageUrl: imageUrl ? imageUrl : null,
          recordUrl: recordUrl ? recordUrl : null,
        }),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
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
  async addUserRevised(
    targetUserId,
    wrongSentence,
    correctedSentence,
    chatroomId,
  ) {
    try {
      const userRef = doc(db, "users", targetUserId);
      const revised = {
        wrongSentence: wrongSentence,
        correctedSentence: correctedSentence,
        chatroomId: chatroomId,
      };
      await updateDoc(userRef, {
        revised: arrayUnion(revised),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async uploadFile(file) {
    try {
      const storageRef = ref(storage, uuidv4());
      const a = await uploadBytes(storageRef, file);
      console.log(a);
      const url = await getDownloadURL(storageRef);
      console.log(url);
      return url;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async storeWord(userId, word) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        saveWords: arrayUnion(word),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async sendIceCandidateToRemote(
    chatroomId,
    userId,
    targetUserId,
    candidate,
    userRole,
  ) {
    const serializeIceCandidate = candidate.toJSON();
    console.log(serializeIceCandidate, userId);
    try {
      const chatroomsColIceCandidatesRef = doc(
        db,
        "chatrooms",
        chatroomId,
        "webrtc",
        `${userRole}IceCandidates`,
      );

      await setDoc(chatroomsColIceCandidatesRef, serializeIceCandidate, {
        merge: true,
      });

      const userColIceCandidatesRef = doc(
        db,
        "users",
        userId,
        "chatrooms",
        chatroomId,
        "webrtc",
        `${userRole}IceCandidates`,
      );
      await setDoc(userColIceCandidatesRef, serializeIceCandidate, {
        merge: true,
      });

      const targetUserIdColIceCandidatesRef = doc(
        db,
        "users",
        targetUserId,
        "chatrooms",
        chatroomId,
        "webrtc",
        `${userRole}IceCandidates`,
      );
      await setDoc(targetUserIdColIceCandidatesRef, serializeIceCandidate, {
        merge: true,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async onRemoteIceCandidate(chatroomId, callback) {
    try {
      const iceCandidatesRef = doc(
        db,
        "chatrooms",
        chatroomId,
        "webrtc",
        "iceCandidates",
      );
      const unsubscribe = onSnapshot(iceCandidatesRef, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            callback(change.doc.data());
            //這邊不用辨認對方的id，因為只有一個聊天室，所以只要有新增就是對方的
          }
        });
      });
      return unsubscribe;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async onRemoteOffer(chatroomId, callback) {
    const chatroomRef = doc(db, "chatrooms", chatroomId);
    try {
      const unsubscribe = onSnapshot(chatroomRef, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            callback(change.doc.data());
          }
        });
      });
      return unsubscribe;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async sendOffer(chatroomId, userId, targetUserId, offer) {
    try {
      const offerData = offer.toJSON();
      const chatroomsColOfferRef = doc(
        db,
        "chatrooms",
        chatroomId,
        "webrtc",
        "offer",
      );
      await setDoc(chatroomsColOfferRef, offerData, { merge: true });
      const userColOfferRef = doc(
        db,
        "users",
        userId,
        "chatrooms",
        chatroomId,
        "webrtc",
        "offer",
      );
      await setDoc(userColOfferRef, offerData, { merge: true });
      const targetUserColOfferRef = doc(
        db,
        "users",
        targetUserId,
        "chatrooms",
        chatroomId,
        "webrtc",
        "offer",
      );
      await setDoc(targetUserColOfferRef, offerData, { merge: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async sendAnswer(chatroomId, userId, targetUserId, answer) {
    try {
      const answerData = answer.toJSON();
      const chatroomsColAnswerRef = doc(
        db,
        "chatrooms",
        chatroomId,
        "webrtc",
        "answer",
      );
      await setDoc(chatroomsColAnswerRef, answerData, { merge: true });
      const userColAnswerRef = doc(
        db,
        "users",
        userId,
        "chatrooms",
        chatroomId,
        "webrtc",
        "answer",
      );
      await setDoc(userColAnswerRef, answerData, { merge: true });
      const targetUserColAnswerRef = doc(
        db,
        "users",
        targetUserId,
        "chatrooms",
        chatroomId,
        "webrtc",
        "answer",
      );
      await setDoc(targetUserColAnswerRef, answerData, { merge: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async onRemoteAnswer(chatroomId, callback) {
    const chatroomRef = doc(db, "chatrooms", chatroomId);
    try {
      const unsubscribe = onSnapshot(chatroomRef, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            callback(change.doc.data());
          }
        });
      });
      return unsubscribe;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async deleteWebRTCData(chatroomId, userId, targetUserId) {
    try {
      const chatroomsColRef = collection(db, "chatrooms", chatroomId, "webrtc");
      getDocs(chatroomsColRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      });

      const usersColRef = collection(
        db,
        "users",
        userId,
        "chatrooms",
        chatroomId,
        "webrtc",
      );
      getDocs(usersColRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      });
      const targetUsersColRef = collection(
        db,
        "users",
        targetUserId,
        "chatrooms",
        chatroomId,
        "webrtc",
      );
      getDocs(targetUsersColRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export default api;
