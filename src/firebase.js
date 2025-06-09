// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';//認証機能用
// Firebase構成オブジェクト(コンソールからコピペ)

const firebaseConfig = {
   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
appId: process.env.REACT_APP_FIREBASE_APP_ID
  };
  
// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Firebase認証(Auth)を使う準備
const auth = getAuth(app); // 認証サービス本体
const provider = new GoogleAuthProvider(); // Googleログイン専用の「認証プロバイダ」
// 他のファイルでも使えるように、エクスポート
export { db, auth, provider };
