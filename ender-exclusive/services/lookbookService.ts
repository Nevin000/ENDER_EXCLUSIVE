import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { auth, adminAuth, db, adminDb } from "@/firebase/config";
import { LookBookCollection } from "@/types/lookbook";

const getFirestoreDb = () => (adminAuth.currentUser ? adminDb : db);

const COLLECTION_NAME = "lookbook_collections";

export const createLookbookCollection = async (
  data: Omit<LookBookCollection, "id">
): Promise<string> => {
  const docRef = await addDoc(collection(getFirestoreDb(), COLLECTION_NAME), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getLookbookCollections = async (options?: {
  status?: string;
  gender?: string;
  season?: string;
}): Promise<LookBookCollection[]> => {
  try {
    const collRef = collection(getFirestoreDb(), COLLECTION_NAME);
    let q = query(collRef, orderBy("createdAt", "desc"));

    if (options?.status) {
      q = query(collRef, where("status", "==", options.status));
    }

    const snapshot = await getDocs(q);
    let collections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<LookBookCollection, "id">),
    }));

    if (options?.gender && options.gender !== "all") {
      collections = collections.filter(
        (c) => c.gender === options.gender || c.gender === "all" || c.gender === "unisex"
      );
    }

    if (options?.season && options.season !== "all-season") {
      collections = collections.filter(
        (c) => c.season === options.season || c.season === "all-season"
      );
    }

    return collections;
  } catch (error) {
    console.error("Error fetching lookbook collections:", error);
    return [];
  }
};

export const getLookbookCollectionBySlug = async (
  slug: string
): Promise<LookBookCollection | null> => {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where("slug", "==", slug)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...(docSnap.data() as Omit<LookBookCollection, "id">),
    };
  } catch (error) {
    console.error("Error fetching collection by slug:", error);
    return null;
  }
};

export const getLookbookCollectionById = async (
  id: string
): Promise<LookBookCollection | null> => {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<LookBookCollection, "id">),
    };
  } catch (error) {
    console.error("Error fetching collection by id:", error);
    return null;
  }
};

export const updateLookbookCollection = async (
  id: string,
  data: Partial<LookBookCollection>
): Promise<void> => {
  const docRef = doc(getFirestoreDb(), COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteLookbookCollection = async (id: string): Promise<void> => {
  const docRef = doc(getFirestoreDb(), COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
