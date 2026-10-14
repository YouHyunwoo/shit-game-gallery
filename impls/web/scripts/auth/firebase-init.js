// Firebase 앱 초기화 및 서비스 인스턴스 내보내기
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
    getAuth
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
    getFirestore
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {
    getStorage
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyDM5KEEU5nU70bSbNGzLGvPyFQkV-sO0C0",
  authDomain: "shit-game-gallery.firebaseapp.com",
  projectId: "shit-game-gallery",
  storageBucket: "shit-game-gallery.appspot.com",
  messagingSenderId: "300645455058",
  appId: "1:300645455058:web:66ea8f20b2d494cb0f090b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
