import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA__VCR9IGqmFxjSk0e3pcu5dh6IRdzNr0",
  authDomain: "task-6ced7.firebaseapp.com",
  projectId: "task-6ced7",
  storageBucket: "task-6ced7.firebasestorage.app",
  messagingSenderId: "693208081052",
  appId: "1:693208081052:web:1e8336dca22b53d9e80359",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
