import { doc, getDoc } from "firebase/firestore";
import { db, adminDb } from "@/firebase/config";

export const getUserData = async (uid: string) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }
  } catch (err) {
    console.warn("getUserData failed via db, trying adminDb:", err);
  }

  try {
    const userRef = doc(adminDb, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
  } catch (err) {
    console.error("getUserData failed on both instances:", err);
  }

  return null;
};

export const getAdminUserData = async (uid: string) => {
  try {
    const userRef = doc(adminDb, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }
  } catch (err) {
    console.warn("getAdminUserData failed via adminDb, trying db:", err);
  }

  return getUserData(uid);
};
