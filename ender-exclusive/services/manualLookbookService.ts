import { db } from "@/firebase/config";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { LookBookProductStyle } from "@/types/lookbook";

const COLLECTION_NAME = "lookbook_product_styles";

/**
 * Save a Manual Styling Guide to Firestore
 */
export async function saveLookbookProductStyle(
  data: Omit<LookBookProductStyle, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    // We use the productId as the document ID so we only have ONE styling per product
    const docRef = doc(db, COLLECTION_NAME, data.productId);
    
    // Check if exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    
    return data.productId;
  } catch (error) {
    console.error("Error saving Look Book style:", error);
    throw error;
  }
}

/**
 * Get a Manual Styling Guide by Product ID
 */
export async function getLookbookProductStyle(
  productId: string
): Promise<LookBookProductStyle | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LookBookProductStyle;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Look Book style:", error);
    return null;
  }
}
