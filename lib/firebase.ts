import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjQilcjxXN9YeyD9DD87DJ07GwZrDwh_E",
  authDomain: "video-c062c.firebaseapp.com",
  projectId: "video-c062c",
  storageBucket: "video-c062c.firebasestorage.app",
  messagingSenderId: "486678253025",
  appId: "1:486678253025:web:fcf258c331b6e3b57ad6a0",
  measurementId: "G-9X60Q93XR8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
