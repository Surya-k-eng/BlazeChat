// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {  
  apiKey:apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "fujo-48b6f.firebaseapp.com",
  projectId: "fujo-48b6f",
  storageBucket: "fujo-48b6f.firebasestorage.app",
  messagingSenderId: "419130076952",
  appId: "1:419130076952:web:6e7b7a747d47130d6ab86d",
  measurementId: "G-1G1NK3NS38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase initialized:", app.name); // should print [DEFAULT]
console.log("Auth instance:", auth);