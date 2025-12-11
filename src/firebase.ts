// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPZQhv_Ox_FytpDR_jU0bsyWmZcPa_xxk",
  authDomain: "new-chitwan-driving.firebaseapp.com",
  projectId: "new-chitwan-driving",
  storageBucket: "new-chitwan-driving.firebasestorage.app",
  messagingSenderId: "538552281062",
  appId: "1:538552281062:web:b6f756314ff53accb11827",
  measurementId: "G-QRT5W9H4D6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT these so other files can use them
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
