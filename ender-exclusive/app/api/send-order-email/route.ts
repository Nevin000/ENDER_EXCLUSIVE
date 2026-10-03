import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@enderexclusive.com";
const FROM_EMAIL  = process.env.FROM_EMAIL  || "Ender Exclusive <orders@enderexclusive.com>";

// ─────────────────────────────────────────────────────────────────────
// 1. RATE LIMITER (per IP)
// ─────────────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;              // 5 requests
const RATE_LIMIT_WINDOW_MS = 60_000;   // per 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

// ─────────────────────────────────────────────────────────────────────
// 2. HTML ESCAPE (XSS prevention)
// ─────────────────────────────────────────────────────────────────────
function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─────────────────────────────────────────────────────────────────────
// 3. ORDER VALIDATION
// ─────────────────────────────────────────────────────────────────────
function isValidOrder(order: any): boolean {
  if (!order || typeof order !== "object") return false;
  if (!order.orderNo || typeof order.orderNo !== "string") return false;
  if (!order.customerName || typeof order.customerName !== "string") return false;
  if (!Array.isArray(order.items) || order.items.length === 0) return false;
  if (!order.shippingAddress?.email || typeof order.shippingAddress.email !== "string") return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(order.shippingAddress.email)) return false;

  if (typeof order.total !== "number" || order.total < 0) return false;

  return true;
}

// ─────────────────────────────────────────────────────────────────────
// 4. CURRENCY HELPER
// ─────────────────────────────────────────────────────────────────────
const rs = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;

// ─────────────────────────────────────────────────────────────────────
// 5. CUSTOMER EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────────────
function buildCustomerEmail(order: any): string {
  const itemRows = order.items.map((item: any) => {
    const price = item.isOnSale ? (item.salePrice ?? item.price) : item.price;
    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
          <div style="font-weight:600;color:#111;font-size:14px;">${escapeHtml(item.name)}</div>
          <div style="color:#888;font-size:12px;margin-top:2px;">
            ${item.color ? `Color: ${escapeHtml(item.color)}` : ""}
            ${item.size  ? ` &nbsp;|&nbsp; Size: ${escapeHtml(item.size)}` : ""}
          </div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:14px;">×${item.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;color:#111;font-size:14px;">${rs(price * item.quantity)}</td>
      </tr>
    `;
  }).join("");

  const paymentBadge = order.paymentMethod === "bank"
    ? `<span style="background:#dbeafe;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Bank Transfer</span>`
    : `<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Cash on Delivery</span>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Order Confirmed</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#e63946,#c1121f);padding:36px 32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">Order Confirmed!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Thank you for shopping with Ender Exclusive</p>
    </div>
    <div style="background:#fff8f0;border-bottom:1px solid #ffe4cc;padding:16px 32px;">
      <div style="font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Order Number</div>
      <div style="font-size:20px;font-weight:800;color:#e63946;margin-top:2px;">${escapeHtml(order.orderNo)}</div>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:16px;color:#333;margin:0 0 24px;">Hi <strong>${escapeHtml(order.customerName)}</strong>, we've received your order!</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead><tr style="background:#fafafa;">
          <th style="padding:10px 16px;text-align:left;font-size:12px;color:#888;">Item</th>
          <th style="padding:10px 16px;text-align:center;font-size:12px;color:#888;">Qty</th>
          <th style="padding:10px 16px;text-align:right;font-size:12px;color:#888;">Total</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="background:#fafafa;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#555;font-size:14px;">Subtotal</span>
          <span style="font-weight:600;font-size:14px;">${rs(order.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e8e8e8;">
          <span style="color:#555;font-size:14px;">Delivery</span>
          <span style="font-weight:600;font-size:14px;">${order.deliveryCharge === 0 ? "FREE" : rs(order.deliveryCharge)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-weight:800;font-size:17px;color:#111;">Grand Total</span>
          <span style="font-weight:800;font-size:17px;color:#e63946;">${rs(order.total)}</span>
        </div>
      </div>
      <div style="background:#f8faff;border:1px solid #e0e7ff;border-radius:10px;padding:16px;margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:#3730a3;text-transform:uppercase;margin-bottom:10px;">Ship To</div>
        <div style="font-size:14px;color:#333;line-height:1.7;">
          <strong>${escapeHtml(order.shippingAddress.fullName)}</strong><br>
          ${escapeHtml(order.shippingAddress.address)}<br>
          ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.district)}<br>
          Phone: ${escapeHtml(order.shippingAddress.phone)}
        </div>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/orders"
           style="display:inline-block;background:linear-gradient(135deg,#e63946,#c1121f);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:15px;">
          Track My Order →
        </a>
      </div>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #f0f0f0;padding:20px 32px;text-align:center;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#111;">ENDER EXCLUSIVE</p>
      <p style="margin:0;font-size:12px;color:#888;">Questions? Reply to this email</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─────────────────────────────────────────────────────────────────────
// 6. ADMIN EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────────────
function buildAdminEmail(order: any): string {
  const itemRows = order.items.map((item: any) => {
    const price = item.isOnSale ? (item.salePrice ?? item.price) : item.price;
    return `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${escapeHtml(item.name)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;text-align:center;">${escapeHtml(item.color || "-")} / ${escapeHtml(item.size || "-")}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">×${item.quantity}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;text-align:right;">${rs(price * item.quantity)}</td>
      </tr>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Order Alert</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:#1e293b;padding:24px 28px;">
      <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:6px;">ENDER EXCLUSIVE — ADMIN ALERT</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">New Order Received</h1>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:14px;">Order <strong style="color:#f1f5f9;">${escapeHtml(order.orderNo)}</strong></p>
    </div>
    <div style="padding:24px 28px;">
      <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin-bottom:20px;font-size:13px;color:#334155;line-height:1.9;">
        <div><strong>Name:</strong> ${escapeHtml(order.customerName)}</div>
        <div><strong>Email:</strong> ${escapeHtml(order.shippingAddress.email)}</div>
        <div><strong>Phone:</strong> ${escapeHtml(order.shippingAddress.phone)}</div>
        <div><strong>Address:</strong> ${escapeHtml(order.shippingAddress.address)}, ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.district)}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">
        <thead style="background:#f1f5f9;"><tr>
          <th style="padding:10px 14px;text-align:left;color:#64748b;">Product</th>
          <th style="padding:10px 14px;text-align:center;color:#64748b;">Variant</th>
          <th style="padding:10px 14px;text-align:center;color:#64748b;">Qty</th>
          <th style="padding:10px 14px;text-align:right;color:#64748b;">Amount</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;font-size:16px;">
          <span style="font-weight:800;color:#1e293b;">Grand Total</span>
          <span style="font-weight:800;color:#e63946;">${rs(order.total)}</span>
        </div>
      </div>
      ${order.paymentProof ? `
      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
        <div style="font-size:13px;font-weight:700;color:#854d0e;margin-bottom:6px;">Payment Receipt Uploaded</div>
        <a href="${escapeHtml(order.paymentProof)}" style="color:#1d4ed8;font-size:13px;">View Receipt</a>
      </div>
      ` : ""}
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/orders"
           style="display:inline-block;background:#1e293b;color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;font-weight:700;font-size:14px;">
          View in Admin Dashboard →
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─────────────────────────────────────────────────────────────────────
// 7. API ROUTE
// ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ⚡ LAYER 1: Internal secret check (best protection)
    const internalSecret = req.headers.get("x-internal-secret");
    const expectedSecret = process.env.INTERNAL_API_SECRET;

    if (expectedSecret && internalSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ⚡ LAYER 2: Rate limiting (per IP)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || req.headers.get("x-real-ip")
            || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // ⚡ LAYER 3: Parse + validate
    const body = await req.json();
    const { order } = body;

    if (!isValidOrder(order)) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    // ⚡ LAYER 4: Env check
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const customerEmail = order.shippingAddress?.email || order.userEmail;
    if (!customerEmail) {
      return NextResponse.json(
        { error: "No customer email provided" },
        { status: 400 }
      );
    }

    // ⚡ Send emails
    const results = await Promise.allSettled([
      resend.emails.send({
        from: FROM_EMAIL,
        to: [customerEmail],
        subject: `✅ Order Confirmed — ${escapeHtml(order.orderNo)} | Ender Exclusive`,
        html: buildCustomerEmail(order),
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `🛒 New Order: ${escapeHtml(order.orderNo)} — ${escapeHtml(order.customerName)}`,
        html: buildAdminEmail(order),
      }),
    ]);

    // ⚡ Response (don't leak internal errors)
    return NextResponse.json({
      customer: { success: results[0].status === "fulfilled" },
      admin: { success: results[1].status === "fulfilled" },
    }, { status: 200 });

  } catch (error: any) {
    console.error("[send-order-email] Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}