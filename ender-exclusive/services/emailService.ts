// services/emailService.ts

import { Order } from "@/types/order";

// 🔥 Temporarily disabled - Email service not configured yet
export const sendOrderConfirmationEmail = async (
  email: string,
  orderId: string,
  orderData: Order
): Promise<boolean> => {
  console.log("📧 Email would be sent to:", email);
  console.log("📧 Order ID:", orderId);
  console.log("📧 Order Data:", orderData);
  
  // 🔥 Return true without sending email
  return true;
  
  // 🔥 Uncomment when email service is configured:
  /*
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: `Order Confirmation - #${orderId.slice(0, 8).toUpperCase()}`,
        orderId: orderId,
        orderData: orderData,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
  */
};