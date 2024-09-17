// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Your web app's Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: "nest-finder-cb4c3.firebaseapp.com",
  projectId: "nest-finder-cb4c3",
  storageBucket: "nest-finder-cb4c3.appspot.com",
  messagingSenderId: "3616035143",
  appId: "1:3616035143:web:40de53d2fd6d0ca50d3c62"
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig);