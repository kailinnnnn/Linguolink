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
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      const userRef = doc(db, "user", user.uid);
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
      const userRef = doc(db, "user", uid);
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
      const userRef = doc(db, "user", user.uid);
      const docSnap = await getDoc(userRef);
      const userData = docSnap.data();
      // const user = userCredential.user;
      // const userRef = doc(db, "user", user.uid);
      // return await getDoc(userRef).data();
      return userData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export default api;
