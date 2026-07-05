import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

import { auth, db } from "@/firebase/config";

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    firstName,
    lastName,
    email,
    role: "user",
    createdAt: new Date(),
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(
    auth,
    provider,
  );

  const user = result.user;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // 🔥 Only write role if the document doesn't already have one
  // This prevents overwriting an existing "admin" role with "user"
  const existingRole = userSnap.exists() ? userSnap.data().role : null;

  await setDoc(
    userRef,
    {
      uid: user.uid,
      firstName:
        user.displayName?.split(" ")[0] || "",
      lastName:
        user.displayName
          ?.split(" ")
          .slice(1)
          .join(" ") || "",
      email: user.email,
      role: existingRole || "user", // preserve existing role, default new users to "user"
      createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date(),
      updatedAt: new Date(),
    },
  );

  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
};