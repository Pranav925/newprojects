// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDOu8dI1X80gU873HZ5ABP8humab9agYZA",
  authDomain: "nexdrive-pro.firebaseapp.com",
  projectId: "nexdrive-pro",
  storageBucket: "nexdrive-pro.firebasestorage.app",
  messagingSenderId: "535847602267",
  appId: "1:535847602267:web:46c9e81296b7f7a874177e",
  measurementId: "G-SKV2G65D9G"
};

// REPLACE WITH YOUR CONFIG
initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };