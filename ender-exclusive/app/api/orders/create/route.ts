import { NextRequest, NextResponse } from "next/server";
import { doc, collection, runTransaction, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

interface OrderItemPayload {
  productId: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
}

interface CreateOrderRequestBody {
  userEmail: string;
  customerName: string;
  items: OrderItemPayload[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode?: string;
    notes?: string;
  };
  paymentMethod: "cod" | "bank";
  paymentProof?: string | null;
}

// ── 1. Phone Validation & Canonical Formatting (Sri Lanka E.164) ────────────
const DUMMY_PHONE_NUMBERS = new Set([
  "+94700000000",
  "+94712345678",
  "+94777777777",
  "+94788888888",
  "+94799999999",
  "+94711111111",
  "+94722222222",
  "+94733333333",
  "+94744444444",
  "+94755555555",
  "+94766666666",
]);

function validateAndFormatSLPhone(rawPhone: string): { isValid: boolean; formatted: string; reason?: string } {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { isValid: false, formatted: "", reason: "Phone number is required" };
  }

  // Remove spaces, dashes, brackets
  let clean = rawPhone.replace(/[\s\-\(\)]/g, "");

  // Convert 07XXXXXXXX to +947XXXXXXXX
  if (/^07[0-9]{8}$/.test(clean)) {
    clean = "+94" + clean.slice(1);
  } else if (/^7[0-9]{8}$/.test(clean)) {
    clean = "+94" + clean;
  } else if (/^947[0-9]{8}$/.test(clean)) {
    clean = "+" + clean;
  }

  // Check valid Sri Lankan E.164 format (+947XXXXXXXX)
  const isFormatValid = /^\+947[0-9]{8}$/.test(clean);
  if (!isFormatValid) {
    return { isValid: false, formatted: clean, reason: "Invalid Sri Lankan mobile number format (Must be 07XXXXXXXX or +947XXXXXXXX)" };
  }

  // Check dummy repeat pattern
  if (DUMMY_PHONE_NUMBERS.has(clean)) {
    return { isValid: false, formatted: clean, reason: "Entered phone number is a known dummy/test pattern" };
  }

  return { isValid: true, formatted: clean };
}

// ── 2. Secure Firebase ID Token Verification ─────────────────────────────────
async function verifyFirebaseIdToken(
  idToken: string
): Promise<{ uid: string; email?: string } | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error("Missing NEXT_PUBLIC_FIREBASE_API_KEY for token verification.");
      return null;
    }

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const user = data.users?.[0];
    if (!user || !user.localId) return null;

    return { uid: user.localId, email: user.email };
  } catch (err) {
    console.error("Firebase ID Token verification error:", err);
    return null;
  }
}

// ── 3. Secure Order Number Generator ─────────────────────────────────────────
function generateSecureOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomValues = new Uint8Array(3);
  crypto.getRandomValues(randomValues);
  const hex = Array.from(randomValues)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `EX-${dateStr}-${hex}`;
}

export async function POST(req: NextRequest) {
  try {
    // ── STEP A: Authenticate Bearer Token ────────────────────────────────────
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or malformed authorization header." },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1]?.trim();
    if (!idToken) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authentication token." },
        { status: 401 }
      );
    }

    const verifiedUser = await verifyFirebaseIdToken(idToken);
    if (!verifiedUser) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired authentication token." },
        { status: 401 }
      );
    }

    const authenticatedUid = verifiedUser.uid;

    const body: CreateOrderRequestBody = await req.json();
    const {
      userEmail,
      customerName,
      items,
      shippingAddress,
      paymentMethod,
      paymentProof,
    } = body;

    // ── STEP B: Input Validation & Phone Number Fraud Inspection ─────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Please select items to place an order." },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.phone) {
      return NextResponse.json(
        { error: "Shipping details are incomplete." },
        { status: 400 }
      );
    }

    // Phone Validation
    const phoneCheck = validateAndFormatSLPhone(shippingAddress.phone);
    if (!phoneCheck.isValid) {
      return NextResponse.json(
        { error: `Phone verification failed: ${phoneCheck.reason}` },
        { status: 400 }
      );
    }

    // Override shipping phone with canonical formatted +947XXXXXXXX
    shippingAddress.phone = phoneCheck.formatted;

    // Deduplicate / Merge items by Product ID + Size + Color
    const itemMap = new Map<string, OrderItemPayload>();
    let totalItemCount = 0;

    for (const item of items) {
      if (!item.productId || typeof item.productId !== "string") {
        return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
      }

      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
        return NextResponse.json(
          { error: "Item quantity must be a whole number between 1 and 50." },
          { status: 400 }
        );
      }

      totalItemCount += qty;
      const key = `${item.productId}_${item.selectedSize || "default"}_${item.selectedColor || "default"}`;
      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!;
        existing.quantity = Math.min(50, existing.quantity + qty);
      } else {
        itemMap.set(key, { ...item, quantity: qty });
      }
    }

    const deduplicatedItems = Array.from(itemMap.values());

    // ── STEP C: Execute Atomic Transaction ───────────────────────────────────
    const orderNumber = generateSecureOrderNumber();
    const newOrderRef = doc(collection(db, "orders"));

    const initialPaymentStatus: "pending" | "verification_pending" =
      paymentMethod === "bank" && paymentProof
        ? "verification_pending"
        : "pending";

    const transactionResult = await runTransaction(db, async (transaction) => {
      // 1. ALL READS FIRST
      const productDocSnaps = await Promise.all(
        deduplicatedItems.map((item) =>
          transaction.get(doc(db, "products", item.productId))
        )
      );

      let subtotal = 0;
      const verifiedItems: any[] = [];
      const uniqueDeliveryCharges = new Map<string, number>();

      // 2. VALIDATION & PRICE COMPUTATION
      for (let i = 0; i < deduplicatedItems.length; i++) {
        const item = deduplicatedItems[i];
        const productSnap = productDocSnaps[i];

        if (!productSnap.exists()) {
          throw new Error(`Product "${item.productId}" no longer exists.`);
        }

        const productData = productSnap.data();

        const currentStock = Number(productData.stock) || 0;
        if (currentStock < item.quantity) {
          throw new Error(
            currentStock === 0
              ? `"${productData.name}" is currently out of stock.`
              : `Only ${currentStock} units left for "${productData.name}". Requested ${item.quantity}.`
          );
        }

        const basePrice = Number(productData.price) || 0;
        const salePrice = productData.salePrice ? Number(productData.salePrice) : null;
        const isOnSale = Boolean(
          productData.isOnSale && salePrice !== null && salePrice < basePrice
        );
        const actualUnitPrice = isOnSale && salePrice !== null ? salePrice : basePrice;

        const itemTotal = actualUnitPrice * item.quantity;
        subtotal += itemTotal;

        const deliveryCharge = Number(productData.deliveryCharge) || 0;
        if (!uniqueDeliveryCharges.has(item.productId)) {
          uniqueDeliveryCharges.set(item.productId, deliveryCharge);
        }

        verifiedItems.push({
          id: `${item.productId}_${item.selectedSize || "default"}_${item.selectedColor || "default"}`,
          productId: item.productId,
          name: productData.name,
          price: actualUnitPrice,
          originalPrice: basePrice,
          isOnSale,
          quantity: item.quantity,
          size: item.selectedSize || null,
          color: item.selectedColor || null,
          image:
            Array.isArray(productData.images) && productData.images.length > 0
              ? productData.images[0]
              : productData.image || "",
          deliveryCharge,
        });

        // 3. ALL WRITES AFTER READS
        const productRef = doc(db, "products", item.productId);
        transaction.update(productRef, {
          stock: currentStock - item.quantity,
          updatedAt: Timestamp.now(),
        });
      }

      const verifiedDeliveryCharge = [...uniqueDeliveryCharges.values()].reduce(
        (sum, charge) => sum + charge,
        0
      );
      const verifiedTotal = subtotal + verifiedDeliveryCharge;

      // 🛡️ COD & Order Fraud Detection Engine
      const suspiciousReasons: string[] = [];
      let isSuspicious = false;

      if (paymentMethod === "cod") {
        // High-Value COD Order Flag (> Rs. 35,000)
        if (verifiedTotal > 35000) {
          isSuspicious = true;
          suspiciousReasons.push(`High-value COD order (Rs. ${verifiedTotal.toLocaleString()}) requires manual call confirmation.`);
        }
        // High Quantity Item Count Flag (> 10 items)
        if (totalItemCount > 10) {
          isSuspicious = true;
          suspiciousReasons.push(`Unusually high item count (${totalItemCount} items) placed via Cash on Delivery.`);
        }
      }

      const verificationStatus = isSuspicious
        ? "requires_call_confirmation"
        : paymentMethod === "bank"
        ? "requires_receipt_review"
        : "auto_verified";

      const orderDocument = {
        orderNo: orderNumber,
        userId: authenticatedUid,
        userEmail: verifiedUser.email || userEmail || shippingAddress.email,
        customerName: customerName || shippingAddress.fullName,
        items: verifiedItems,
        subtotal,
        deliveryCharge: verifiedDeliveryCharge,
        total: verifiedTotal,
        totalAmount: verifiedTotal,
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        orderStatus: "pending",
        verificationStatus,
        isSuspicious,
        suspiciousReasons,
        shippingAddress,
        delivery: {
          method: "standard",
          charge: verifiedDeliveryCharge,
          estimatedDays: 3,
        },
        paymentProof: paymentProof || null,
        trackingNumber: null,
        orderDate: new Date().toISOString(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      transaction.set(newOrderRef, orderDocument);

      return {
        orderId: newOrderRef.id,
        orderNo: orderNumber,
        subtotal,
        deliveryCharge: verifiedDeliveryCharge,
        total: verifiedTotal,
        isSuspicious,
        verificationStatus,
      };
    });

    return NextResponse.json(
      {
        success: true,
        ...transactionResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API Order Creation Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process order." },
      { status: 400 }
    );
  }
}
