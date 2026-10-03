// services/orderService.ts

import { auth, adminAuth, db, adminDb } from "@/firebase/config";
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
  increment,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { CartItem } from "@/types/cart";
import { Order } from "@/types/order";

const getFirestoreDb = () => (adminAuth.currentUser ? adminDb : db);

const COLLECTION_NAME = "orders";
const PRODUCTS_COLLECTION = "products";

// 🔥 Create Order - Via Trusted Server API (Requires Auth Token & Server Verification)
export const createOrder = async (orderData: Omit<Order, "id">): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to place an order.");
    }

    const idToken = await currentUser.getIdToken();

    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        userEmail: orderData.userEmail,
        customerName: orderData.customerName,
        items: orderData.items.map((item) => ({
          productId: item.productId,
          selectedSize: item.size || undefined,
          selectedColor: item.color || undefined,
          quantity: item.quantity,
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentProof: orderData.paymentProof || null,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to process order on server.");
    }

    return data.orderId;
  } catch (error: any) {
    console.error("Error creating order via trusted server API:", error);
    throw error;
  }
};

// 🔥 Get Order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        orderStatus: data.orderStatus || "pending",
        paymentStatus: data.paymentStatus || "pending",
      } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

// 🔥 Get User Orders
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(getFirestoreDb(), COLLECTION_NAME),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
    
    return orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw error;
  }
};

// 🔥 Update Order Status
export const updateOrderStatus = async (orderId: string, status: Order["orderStatus"]): Promise<void> => {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, orderId);
    await updateDoc(docRef, {
      orderStatus: status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// 🔥 Cancel Order - Safely Restore Stock via Transaction
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    const activeDb = getFirestoreDb();
    await runTransaction(activeDb, async (transaction) => {
      const orderRef = doc(activeDb, COLLECTION_NAME, orderId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) {
        throw new Error("Order not found");
      }

      const orderData = orderSnap.data() as Order;

      if (orderData.orderStatus === "cancelled") {
        throw new Error("Order is already cancelled.");
      }

      // Read product stock inside transaction
      const productSnaps = await Promise.all(
        orderData.items.map((item) =>
          transaction.get(doc(activeDb, PRODUCTS_COLLECTION, item.productId))
        )
      );

      // Restore stock for each item inside transaction
      for (let i = 0; i < orderData.items.length; i++) {
        const item = orderData.items[i];
        const pSnap = productSnaps[i];
        if (pSnap.exists()) {
          const productRef = doc(activeDb, PRODUCTS_COLLECTION, item.productId);
          const currentStock = Number(pSnap.data().stock) || 0;
          transaction.update(productRef, {
            stock: currentStock + item.quantity,
            updatedAt: Timestamp.now(),
          });
        }
      }

      // Mark order as cancelled inside transaction
      transaction.update(orderRef, {
        orderStatus: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

// 🔥 Get All Orders (Admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const activeDb = getFirestoreDb();
    const snapshot = await getDocs(collection(activeDb, COLLECTION_NAME));
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];

    return orders.sort((a, b) => {
      const getTime = (val: any): number => {
        if (!val) return 0;
        if (typeof val === "object" && val.seconds) return val.seconds * 1000;
        if (typeof val === "string") return new Date(val).getTime();
        if (typeof val === "number") return val;
        return 0;
      };
      return getTime(b.createdAt || b.orderDate) - getTime(a.createdAt || a.orderDate);
    });
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw error;
  }
};

// 🔥 Update Order with Payment Proof
export const updateOrderPaymentProof = async (orderId: string, proofUrl: string): Promise<void> => {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, orderId);
    await updateDoc(docRef, {
      paymentProof: proofUrl,
      paymentStatus: "paid",
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating payment proof:", error);
    throw error;
  }
};

// 🔥 Delete Order (Admin only)
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// 🔥 Update Order Delivery & Tracking Details
export const updateOrderDeliveryDetails = async (
  orderId: string,
  deliveryDetails: {
    orderStatus?: Order["orderStatus"];
    trackingNumber: string;
    deliveryCompany: string;
    deliveryNotes?: string;
  }
): Promise<void> => {
  try {
    const docRef = doc(getFirestoreDb(), COLLECTION_NAME, orderId);
    await updateDoc(docRef, {
      ...(deliveryDetails.orderStatus && { orderStatus: deliveryDetails.orderStatus }),
      trackingNumber: deliveryDetails.trackingNumber,
      deliveryCompany: deliveryDetails.deliveryCompany,
      deliveryNotes: deliveryDetails.deliveryNotes || "",
      handoverDate: new Date().toISOString(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating order delivery details:", error);
    throw error;
  }
};

// 🔥 Export Order type
export type { Order };