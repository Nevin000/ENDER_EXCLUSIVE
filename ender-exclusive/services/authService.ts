import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

import { auth, adminAuth, db } from "@/firebase/config";

// ─── CUSTOMER AUTH ────────────────────────────────────────

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
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

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const existingRole = userSnap.exists() ? userSnap.data().role : null;

  await setDoc(userRef, {
    uid: user.uid,
    firstName: user.displayName?.split(" ")[0] || "",
    lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
    email: user.email,
    role: existingRole || "user",
    createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date(),
    updatedAt: new Date(),
  });

  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// ─── ADMIN AUTH (Isolated Secondary Firebase Instance) ───

export const loginAdminUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    adminAuth,
    email,
    password
  );
  return userCredential.user;
};

export const logoutAdminUser = async () => {
  await signOut(adminAuth);
};