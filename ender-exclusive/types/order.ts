// types/order.ts

import { CartItem } from "./cart";

export interface Order {
  id?: string;
  orderNo: string;
  userId: string;
  userEmail: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: "cod" | "bank";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "pending_payment" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    notes: string;
  };
  delivery: {
    method: "standard" | "express";
    charge: number;
    estimatedDays: number;
  };
  paymentProof?: string | null;
  trackingNumber?: string | null;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}