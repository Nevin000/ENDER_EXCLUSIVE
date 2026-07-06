/**
 * Sends order confirmation emails (customer + admin) via the /api/send-order-email route.
 * Fires-and-forgets — does NOT block the order placement flow.
 */
export async function sendOrderEmails(order: any): Promise<void> {
  try {
    const res = await fetch("/api/send-order-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("[Email] Failed to send order emails:", err);
    }
  } catch (err) {
    // Non-critical — order is already placed; just log
    console.warn("[Email] Error calling email API:", err);
  }
}

// ── Legacy stub (kept for backward compatibility) ──
export const sendOrderConfirmationEmail = async (
  _email: string,
  _orderId: string,
  _orderData: any
): Promise<boolean> => true;