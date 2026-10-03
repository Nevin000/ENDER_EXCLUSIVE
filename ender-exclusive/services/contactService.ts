// services/contactService.ts

import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: "unread" | "read" | "replied";
  createdAt?: any;
  createdAtIso?: string;
}

const COLLECTION_NAME = "contact_messages";

// 🔥 Save Contact Form Inquiry (Client Firestore + API Route Fallback)
export const sendContactMessage = async (
  data: Omit<ContactMessage, "id" | "status" | "createdAt" | "createdAtIso">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || "",
      subject: data.subject || "General Inquiry",
      message: data.message.trim(),
      status: "unread",
      createdAt: Timestamp.now(),
      createdAtIso: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error: any) {
    console.warn("[contactService] Client Firestore write error, trying /api/contact fallback...", error?.message || error);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to send contact message.");
      }

      const resJson = await res.json();
      return resJson.id || "success";
    } catch (apiErr: any) {
      console.error("[contactService] API route fallback also failed:", apiErr);
      throw new Error("Unable to submit contact message. Please try again or reach us via WhatsApp.");
    }
  }
};

// 🔥 Fetch Contact Messages (For Admin Dashboard)
export const getContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ContactMessage[];
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    throw error;
  }
};
