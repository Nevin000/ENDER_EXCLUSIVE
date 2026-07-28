// services/orderService.ts

import { db } from "@/firebase/config";
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
} from "firebase/firestore";
import { CartItem } from "@/types/cart";
import { Order } from "@/types/order";

const COLLECTION_NAME = "orders";
const PRODUCTS_COLLECTION = "products";

// 🔥 Create Order - Using Batch instead of Transaction (More reliable)
export const createOrder = async (orderData: Omit<Order, "id">): Promise<string> => {
  try {
    const batch = writeBatch(db);
    let orderId = "";

    // 🔥 1. Check and update product stocks
    for (const item of orderData.items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const currentStock = productSnap.data().stock || 0;
      if (currentStock < item.quantity) {
        throw new Error(
          currentStock === 0
            ? `"${item.name}" is currently out of stock. Please remove it from your cart.`
            : `Not enough stock for "${item.name}". You requested ${item.quantity} but only ${currentStock} left.`
        );
      }

      // Add stock update to batch
      batch.update(productRef, {
        stock: increment(-item.quantity),
        updatedAt: Timestamp.now(),
      });
    }

    // 🔥 2. Create order
    const orderRef = doc(collection(db, COLLECTION_NAME));
    batch.set(orderRef, {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    orderId = orderRef.id;

    // 🔥 3. Commit all changes
    await batch.commit();

    return orderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// 🔥 Get Order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
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
    // 🔥 Query without orderBy
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
    
    // 🔥 Sort in memory
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
    const docRef = doc(db, COLLECTION_NAME, orderId);
    await updateDoc(docRef, {
      orderStatus: status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// 🔥 Cancel Order - Restore Stock
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    // 1. Get order
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error("Order not found");
    }

    const orderData = orderSnap.data() as Order;
    
    // 2. Create batch for stock restoration
    const batch = writeBatch(db);
    
    // 3. Restore stock for each item
    for (const item of orderData.items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      batch.update(productRef, {
        stock: increment(item.quantity),
        updatedAt: Timestamp.now(),
      });
    }

    // 4. Update order status
    batch.update(orderRef, {
      orderStatus: "cancelled",
      updatedAt: Timestamp.now(),
    });

    // 5. Commit all changes
    await batch.commit();
    
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

// 🔥 Get All Orders (Admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw error;
  }
};

// 🔥 Update Order with Payment Proof
export const updateOrderPaymentProof = async (orderId: string, proofUrl: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
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
    const docRef = doc(db, COLLECTION_NAME, orderId);
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
    const docRef = doc(db, COLLECTION_NAME, orderId);
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