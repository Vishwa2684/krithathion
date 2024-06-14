// Import the functions you need from the SDKs you need

// U got to import required features in config
import { initializeApp} from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PID,
  storageBucket: import.meta.env.VITE_FS_PB,
  messagingSenderId: import.meta.env.VITE_FS_MSID,
  appId: import.meta.env.VITE_FB_AID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// this is the database we are using in our app
export const db =getFirestore(app)
export const auth =getAuth(app)