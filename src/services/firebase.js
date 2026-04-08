import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgJ4GVkCVKwEodQ8AIgSLVGlbXujUWjLg",
  authDomain: "ascension-protocol-bcfd4.firebaseapp.com",
  projectId: "ascension-protocol-bcfd4",
  storageBucket: "ascension-protocol-bcfd4.firebasestorage.app",
  messagingSenderId: "47433168946",
  appId: "1:47433168946:web:9ccf2fe668cef0fd2b642b",
  measurementId: "G-MZNSKHGYQ5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);