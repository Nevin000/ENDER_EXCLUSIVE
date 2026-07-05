import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export const getUserData = async (uid: string) => {
  const userRef = doc(db, "users", uid);

  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }

  return null;
};
