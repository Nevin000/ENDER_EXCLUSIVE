import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Customer App (default)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Dedicated Admin App (isolated secondary app instance for admin session)
const ADMIN_APP_NAME = "ender-admin-app";
const getAdminApp = () => {
  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existing) return existing;
  return initializeApp(firebaseConfig, ADMIN_APP_NAME);
};

export const adminApp = getAdminApp();

const safeGetAuth = (appInstance = app): Auth => {
  try {
    return getAuth(appInstance);
  } catch (e) {
    return {} as Auth;
  }
};

const safeGetDb = (appInstance = app): Firestore => {
  try {
    return getFirestore(appInstance);
  } catch (e) {
    return {} as Firestore;
  }
};

const safeGetStorage = (appInstance = app): FirebaseStorage => {
  try {
    return getStorage(appInstance);
  } catch (e) {
    return {} as FirebaseStorage;
  }
};

export const auth = safeGetAuth(app);
export const adminAuth = safeGetAuth(adminApp);
export const db = safeGetDb(app);
export const adminDb = safeGetDb(adminApp);
export const storage = safeGetStorage(app);

export default app;


