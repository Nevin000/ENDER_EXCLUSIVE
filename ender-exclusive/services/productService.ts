import {
  addDoc,
  getDocs,
  updateDoc,
  getDoc,
  deleteDoc,
  doc,
  collection,
  Timestamp,
} from "firebase/firestore";

import { auth, adminAuth, db, adminDb } from "@/firebase/config";
import { Product } from "@/types/product";

const getFirestoreDb = () => (adminAuth.currentUser ? adminDb : db);

export const createProduct = async (productData: any) => {
  return await addDoc(collection(getFirestoreDb(), "products"), {
    ...productData,

    createdAt: Timestamp.now(),
  });
};

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(getFirestoreDb(), "products"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Product, "id">),
  }));
};

export const deleteProduct = async (productId: string) => {
  await deleteDoc(doc(getFirestoreDb(), "products", productId));
};

export const getProductById = async (
  productId: string
): Promise<Product | null> => {
  const productRef = doc(
    getFirestoreDb(),
    "products",
    productId
  );

  const snapshot = await getDoc(productRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Product, "id">),
  };
};

export const updateProduct = async (productId: string, productData: any) => {
  await updateDoc(doc(getFirestoreDb(), "products", productId), productData);
};

