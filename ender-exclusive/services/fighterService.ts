import { auth, adminAuth, db, adminDb } from "@/firebase/config";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { FighterImage, FighterImageFilterOptions } from "@/types/fighter";

const getFirestoreDb = () => (adminAuth.currentUser ? adminDb : db);

const COLLECTION_NAME = "fighters";

/**
 * Fetch all fighter gallery images, optionally filtered by status and sorted by displayOrder.
 */
export async function getFighterImages(
  options: FighterImageFilterOptions = {}
): Promise<FighterImage[]> {
  try {
    const colRef = collection(getFirestoreDb(), COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    let images: FighterImage[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const url = data.imageUrl || "";
      const isVideoUrl =
        /\.(mp4|webm|mov|mkv|avi)$/i.test(url) || url.includes("/video/upload/");
      const mediaType: "image" | "video" =
        data.mediaType || (isVideoUrl ? "video" : "image");

      return {
        id: docSnap.id,
        imageUrl: url,
        mediaType,
        displayOrder: data.displayOrder || 0,
        status: data.status || "published",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as FighterImage;
    });

    // In-memory status filtering
    if (options.status && options.status !== "all") {
      images = images.filter((img) => img.status === options.status);
    }

    // In-memory mediaType filtering
    if (options.mediaType && options.mediaType !== "all") {
      images = images.filter((img) => img.mediaType === options.mediaType);
    }

    // In-memory sorting by displayOrder ascending
    images.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return images;
  } catch (error) {
    console.error("Error fetching fighter images:", error);
    return [];
  }
}

/**
 * Bulk create fighter media documents in Firestore (e.g. after uploading to Cloudinary).
 */
export async function createFighterImagesBulk(
  items: (string | { url: string; mediaType: "image" | "video" })[],
  initialStatus: "published" | "draft" = "published"
): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    const activeDb = getFirestoreDb();
    // Get current max displayOrder
    const existing = await getFighterImages({ status: "all" });
    const maxOrder = existing.reduce((max, img) => Math.max(max, img.displayOrder || 0), 0);

    const batch = writeBatch(activeDb);
    const colRef = collection(activeDb, COLLECTION_NAME);

    items.forEach((item, index) => {
      const newDocRef = doc(colRef);
      const url = typeof item === "string" ? item : item.url;
      const isVideo = typeof item === "string" 
        ? (/\.(mp4|webm|mov|mkv|avi)$/i.test(url) || url.includes("/video/upload/"))
        : item.mediaType === "video";
      const mediaType: "image" | "video" = isVideo ? "video" : "image";

      batch.set(newDocRef, {
        imageUrl: url,
        mediaType,
        displayOrder: maxOrder + index + 1,
        status: initialStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error bulk creating fighter media:", error);
    throw error;
  }
}


/**
 * Update display order for multiple images using Firestore WriteBatch (drag-and-drop reorder).
 */
export async function updateFighterImagesOrder(
  orderedItems: { id: string; displayOrder: number }[]
): Promise<void> {
  if (!orderedItems || orderedItems.length === 0) return;
  try {
    const activeDb = getFirestoreDb();
    const batch = writeBatch(activeDb);
    orderedItems.forEach((item) => {
      const docRef = doc(activeDb, COLLECTION_NAME, item.id);
      batch.update(docRef, {
        displayOrder: item.displayOrder,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error updating fighter images order:", error);
    throw error;
  }
}

/**
 * Toggle or set publication status for a single image document.
 */
export async function updateFighterImageStatus(
  id: string,
  status: "published" | "draft"
): Promise<void> {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating status for image ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a single image document from Firestore.
 */
export async function deleteFighterImage(id: string): Promise<void> {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting fighter image ${id}:`, error);
    throw error;
  }
}

/**
 * Bulk delete multiple image documents from Firestore.
 */
export async function bulkDeleteFighterImages(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  try {
    const activeDb = getFirestoreDb();
    const batch = writeBatch(activeDb);
    ids.forEach((id) => {
      const docRef = doc(activeDb, COLLECTION_NAME, id);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error bulk deleting fighter images:", error);
    throw error;
  }
}

/**
 * Bulk update status for multiple image documents.
 */
export async function bulkUpdateFighterImagesStatus(
  ids: string[],
  status: "published" | "draft"
): Promise<void> {
  if (!ids || ids.length === 0) return;
  try {
    const activeDb = getFirestoreDb();
    const batch = writeBatch(activeDb);
    ids.forEach((id) => {
      const docRef = doc(activeDb, COLLECTION_NAME, id);
      batch.update(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error bulk updating status for fighter images:", error);
    throw error;
  }
}
