import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyCzJOFDLjCqLrZggTc1mSBRCbbT7h9ZBe8",
  authDomain: "lens-world.firebaseapp.com",
  projectId: "lens-world",
  storageBucket: "lens-world.firebasestorage.app",
  messagingSenderId: "254247514334",
  appId: "1:254247514334:web:c873a8d8a731cff648524f",
  measurementId: "G-JSP8S1ZGER"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
