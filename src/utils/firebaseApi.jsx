import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { GeoPoint } from "firebase/firestore";
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
        id: user.uid,
      };

      if (!docSnap.exists()) {
        await setDoc(userRef, newUser);
      }
      return newUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async nativeRegister(
    email,
    password,
    name,
    birthdate,
    location,
    nativeLanguage,
    alsoSpeak,
    learningLanguage,
    learningLanguageLevel,
    translate,
    communicationStyle,
  ) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);

      let locationData = {};
      if (location) {
        locationData.geopoint = new GeoPoint(location.lat, location.lng);
        locationData.placename = {
          city: location.city,
          country: location.country,
        };
      }

      const userData = {
        name,
        email,
        birthdate,
        location: locationData,
        nativeLanguage,
        alsoSpeak,
        learningLanguage: { learningLanguage, learningLanguageLevel },
        translate,
        communicationStyle,
        aboutMe: {
          topic: "",
          partnerQualities: "",
          goals: "",
        },
        photos: [
          { num: 1, url: "" },
          { num: 2, url: "" },
          { num: 3, url: "" },
          { num: 4, url: "" },
          { num: 5, url: "" },
          { num: 6, url: "" },
        ],
        profilePicture:
          "https://firebasestorage.googleapis.com/v0/b/linguolink-e84b0.appspot.com/o/8ef34a64-68fc-4008-93f0-fa293b0ccc3d?alt=media&token=680f3317-8725-4ee1-8144-e07ee99ed410",
        mainTopic: "",
      };
      await setDoc(userRef, userData);
      return { email, password };
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
  async getAllMembers() {
    try {
      const userCol = collection(db, "users");
      const userSnapshot = await getDocs(userCol);
      const userList = userSnapshot.docs.map((doc) => {
        const data = doc.data();
        data.id = doc.id;
        return data;
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
  async createChatroom(user, targetUser) {
    try {
      const chatroomRef = collection(db, "chatrooms");
      const newChatroomRef = await addDoc(chatroomRef, {
        participants: [user, targetUser],
        createBy: user.id,
        createdAt: serverTimestamp(),
        messages: [],
      });

      const newChatroomId = newChatroomRef.id;

      const userChatroomsRef = doc(
        db,
        "users",
        user.id,
        "chatrooms",
        newChatroomId,
      );
      await setDoc(userChatroomsRef, {
        participants: [user, targetUser],
        createBy: user.id,
        createdAt: serverTimestamp(),
        messages: [],
      });

      const targetUserChatroomsRef = doc(
        db,
        "users",
        targetUser.id,
        "chatrooms",
        newChatroomId,
      );
      await setDoc(targetUserChatroomsRef, {
        participants: [user, targetUser],
        createBy: user.id,
        createdAt: serverTimestamp(),
        messages: [],
      });
      return newChatroomId;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

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

    const unsubChatrooms = onSnapshot(
      userChatroomsRef,
      async (querySnapshot) => {
        querySnapshot.docs.map(async (doc) => {
          const webRTCRef = collection(doc.ref, "webrtc");

          const unsubWebRTC = onSnapshot(webRTCRef, (webRtcSnapshot) => {
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
  async sendMessage(messageData) {
    const {
      chatroomId,
      userId,
      targetUserId,
      content,
      toReviseSent,
      revised,
      comment,
      imageUrl,
    } = messageData;

    try {
      const chatroomRef = doc(db, "chatrooms", chatroomId);
      await updateDoc(chatroomRef, {
        messages: arrayUnion({
          content: content ? content : null,
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
          content: content ? content : null,
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
          content: content ? content : null,
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
  async listenUser(userId, callback) {
    try {
      const userRef = doc(db, "users", userId);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        const userData = doc.data();
        userData.id = doc.id;
        callback(userData);
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
    comment,
    chatroomId,
  ) {
    try {
      const userRef = doc(db, "users", targetUserId);
      const revised = {
        wrongSentence: wrongSentence,
        correctedSentence: correctedSentence,
        comment: comment,
        chatroomId: chatroomId,
      };
      console.log(revised);
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
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async storeWord(userId, data) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        collections: arrayUnion(data),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async listenWebRTCtest(userId, setWebRTCInfo) {
    const userWebRTCRef = collection(db, "users", userId, "webrtc");
    const unsubWebRTC = onSnapshot(userWebRTCRef, async (querySnapshot) => {
      const webRTCDocs = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      setWebRTCInfo(webRTCDocs);
    });

    return () => {
      unsubWebRTC;
    };
  },

  async sendIceCandidateToRemote(
    chatroomId,
    userId,
    targetUserId,
    candidate,
    userRole,
  ) {
    const serializeIceCandidate = candidate.toJSON();
    try {
      const userWebRTCDocRef = doc(db, "users", userId, "webrtc", chatroomId);
      await setDoc(
        userWebRTCDocRef,
        { [`${userRole}IceCandidates`]: serializeIceCandidate },
        {
          merge: true,
        },
      );

      const targetUserWebRTCDocRef = doc(
        db,
        "users",
        targetUserId,
        "webrtc",
        chatroomId,
      );
      await setDoc(
        targetUserWebRTCDocRef,
        { [`${userRole}IceCandidates`]: serializeIceCandidate },
        {
          merge: true,
        },
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async setVideoStatus(chatroomId, userId, targetUserId, status) {
    try {
      const userWebRTCDocRef = doc(db, "users", userId, "webrtc", chatroomId);
      const targetUserWebRTCDocRef = doc(
        db,
        "users",
        targetUserId,
        "webrtc",
        chatroomId,
      );
      await setDoc(userWebRTCDocRef, status, { merge: true });
      await setDoc(targetUserWebRTCDocRef, status, { merge: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async sendOffer(chatroomId, userId, targetUserId, offer) {
    try {
      const offerData = offer.toJSON();
      const userWebRTCDocRef = doc(db, "users", userId, "webrtc", chatroomId);
      const targetUserWebRTCDocRef = doc(
        db,
        "users",
        targetUserId,
        "webrtc",
        chatroomId,
      );
      await setDoc(userWebRTCDocRef, { offer: offerData }, { merge: true });
      await setDoc(
        targetUserWebRTCDocRef,
        { offer: offerData },
        { merge: true },
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async sendAnswer(chatroomId, userId, targetUserId, answer) {
    try {
      const answerData = answer.toJSON();
      const userWebRTCDocRef = doc(db, "users", userId, "webrtc", chatroomId);
      const targetUserWebRTCDocRef = doc(
        db,
        "users",
        targetUserId,
        "webrtc",
        chatroomId,
      );
      await setDoc(userWebRTCDocRef, { answer: answerData }, { merge: true });
      await setDoc(
        targetUserWebRTCDocRef,
        { answer: answerData },
        { merge: true },
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async deleteWebRTCData(chatroomId, userId, targetUserId) {
    try {
      const userWebRTCDocRef = doc(db, "users", userId, "webrtc", chatroomId);
      const targetUserWebRTCDocRef = doc(
        db,
        "users",
        targetUserId,
        "webrtc",
        chatroomId,
      );

      getDoc(userWebRTCDocRef).then((doc) => {
        deleteDoc(doc.ref);
      });

      getDoc(targetUserWebRTCDocRef).then((doc) => {
        deleteDoc(doc.ref);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async uploadUserPhoto(userId, data) {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      userData.photos[data.num - 1].url = data.url;
      updateDoc(userRef, userData);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async uploadUserProfilePicture(userId, url) {
    try {
      const userRef = doc(db, "users", userId);
      setDoc(userRef, { profilePicture: url }, { merge: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async deleteUserPhoto(userId, num) {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      userData.photos[num - 1].url = "";
      updateDoc(userRef, userData);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async updateUser(userId, data) {
    try {
      const userRef = doc(db, "users", userId);
      let locationData = {};
      if (data.location) {
        locationData.geopoint = new GeoPoint(
          data.location.lat,
          data.location.lng,
        );
        locationData.placename = {
          city: data.location.city,
          country: data.location.country,
        };
      }
      data.location = locationData;
      await updateDoc(userRef, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export default api;
