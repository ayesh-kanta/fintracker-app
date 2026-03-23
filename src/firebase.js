import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBiZXLNRkewd-k7I9f1PtsEhgyccs_6uvA",
  authDomain: "fintracker-app-23937.firebaseapp.com",
  projectId: "fintracker-app-23937",
  storageBucket: "fintracker-app-23937.firebasestorage.app",
  messagingSenderId: "676803541795",
  appId: "1:676803541795:web:dc4a85ab0317e98a2e2a96",
  measurementId: "G-3ZD0NDVMS1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
