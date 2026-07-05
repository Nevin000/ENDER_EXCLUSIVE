import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { CartItem } from "@/types/cart";

const COLLECTION_NAME = "cart";

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<CartItem, "id">),
  }));
};

export const addToCart = async (
  item: Omit<CartItem, "id"> & { userId: string }
): Promise<string> => {
  if (!item.userId) throw new Error("userId is required to add item to cart");
  const cartData = {
    ...item,
    deliveryCharge: item.deliveryCharge ?? 0,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, COLLECTION_NAME), cartData);
  return docRef.id;
};

export const updateCartQuantity = async (cartId: string, quantity: number) => {
  const ref = doc(db, COLLECTION_NAME, cartId);
  await updateDoc(ref, { quantity });
};

export const removeCartItem = async (cartId: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, cartId));
};