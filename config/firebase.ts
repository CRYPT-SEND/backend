// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtaBiSw2xcLMl9ZaecwQHUaSNUIzeCF8M",
  authDomain: "cryptsend-d9089.firebaseapp.com",
  projectId: "cryptsend-d9089",
  storageBucket: "cryptsend-d9089.firebasestorage.app",
  messagingSenderId: "933594535810",
  appId: "1:933594535810:web:f06b664c67fe25d099a19b",
  measurementId: "G-NPBF8L3NHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);