import { initializeApp } from "firebase/app";
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
  apiKey: "AIzaSyA75IRqaTwXBiOX5cVkUEeM3tyl09EMsXI",
  authDomain: "test-firestore-polien.firebaseapp.com",
  projectId: "test-firestore-polien",
  storageBucket: "test-firestore-polien.appspot.com",
  messagingSenderId: "264671613600",
  appId: "1:264671613600:web:1fb15821757b90404a6fc5",
  measurementId: "G-KDE5BW1C7K",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
