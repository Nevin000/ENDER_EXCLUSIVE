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

import { db } from "@/firebase/config";
import { Product } from "@/types/product";

export const createProduct = async (productData: any) => {
  return await addDoc(collection(db, "products"), {
    ...productData,

    createdAt: Timestamp.now(),
  });
};

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Product, "id">),
  }));
};

export const deleteProduct = async (productId: string) => {
  await deleteDoc(doc(db, "products", productId));
};

export const getProductById = async (
  productId: string
): Promise<Product | null> => {
  const productRef = doc(
    db,
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
  await updateDoc(doc(db, "products", productId), productData);
};

