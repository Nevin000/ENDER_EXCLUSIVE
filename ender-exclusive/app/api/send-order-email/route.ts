import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@enderexclusive.com";
const FROM_EMAIL  = process.env.FROM_EMAIL  || "Ender Exclusive <orders@enderexclusive.com>";

// ─────────────────────────────────────────────
// Helper: format currency
// ─────────────────────────────────────────────
const rs = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;

// ─────────────────────────────────────────────
// Customer confirmation email HTML
// ─────────────────────────────────────────────
function buildCustomerEmail(order: any): string {
  const itemRows = order.items.map((item: any) => {
    const price = item.isOnSale ? (item.salePrice ?? item.price) : item.price;
    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
          <div style="font-weight:600;color:#111;font-size:14px;">${item.name}</div>
          <div style="color:#888;font-size:12px;margin-top:2px;">
            ${item.color ? `Color: ${item.color}` : ""}
            ${item.size  ? ` &nbsp;|&nbsp; Size: ${item.size}` : ""}
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

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#e63946,#c1121f);padding:36px 32px;text-align:center;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✅</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Order Confirmed!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Thank you for shopping with Ender Exclusive</p>
    </div>

    <!-- Order number banner -->
    <div style="background:#fff8f0;border-bottom:1px solid #ffe4cc;padding:16px 32px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order Number</div>
        <div style="font-size:20px;font-weight:800;color:#e63946;margin-top:2px;">${order.orderNo}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Date</div>
        <div style="font-size:14px;font-weight:600;color:#333;margin-top:2px;">${new Date(order.orderDate).toLocaleDateString("en-LK", { day:"numeric",month:"long",year:"numeric" })}</div>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">

      <p style="font-size:16px;color:#333;margin:0 0 24px;">Hi <strong>${order.customerName}</strong>, we've received your order and it's being processed. We'll notify you when it ships! 🎉</p>

      <!-- Items table -->
      <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #f0f0f0;">🛍️ Order Items</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#fafafa;">
            <th style="padding:10px 16px;text-align:left;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Item</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Qty</th>
            <th style="padding:10px 16px;text-align:right;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="background:#fafafa;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#555;font-size:14px;">Items Subtotal</span>
          <span style="font-weight:600;font-size:14px;">${rs(order.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e8e8e8;">
          <span style="color:#555;font-size:14px;">Delivery Charge</span>
          <span style="font-weight:600;font-size:14px;color:${order.deliveryCharge === 0 ? "#16a34a" : "#ea580c"}">${order.deliveryCharge === 0 ? "FREE" : rs(order.deliveryCharge)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-weight:800;font-size:17px;color:#111;">Grand Total</span>
          <span style="font-weight:800;font-size:17px;color:#e63946;">${rs(order.total)}</span>
        </div>
      </div>

      <!-- Two columns -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">

        <!-- Shipping address -->
        <div style="background:#f8faff;border:1px solid #e0e7ff;border-radius:10px;padding:16px;">
          <div style="font-size:12px;font-weight:700;color:#3730a3;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">📦 Ship To</div>
          <div style="font-size:14px;color:#333;line-height:1.7;">
            <strong>${order.shippingAddress.fullName}</strong><br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.district}<br>
            ${order.shippingAddress.postalCode ? order.shippingAddress.postalCode + "<br>" : ""}
            📞 ${order.shippingAddress.phone}
          </div>
        </div>

        <!-- Payment info -->
        <div style="background:#f8faff;border:1px solid #e0e7ff;border-radius:10px;padding:16px;">
          <div style="font-size:12px;font-weight:700;color:#3730a3;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">💳 Payment</div>
          <div style="margin-bottom:8px;">${paymentBadge}</div>
          <div style="font-size:13px;color:#555;margin-top:8px;">
            Status: <strong style="color:${order.paymentStatus === "paid" ? "#16a34a" : "#ea580c"}">${order.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}</strong>
          </div>
          ${order.paymentMethod === "bank" && order.paymentStatus !== "paid"
            ? `<div style="font-size:12px;color:#888;margin-top:6px;">Your bank slip is under review.</div>`
            : ""}
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:24px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/orders" 
           style="display:inline-block;background:linear-gradient(135deg,#e63946,#c1121f);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:15px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(230,57,70,0.35);">
          Track My Order →
        </a>
      </div>

      <!-- Delivery estimate -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;text-align:center;">
        <div style="font-size:13px;color:#166534;">🚚 <strong>Estimated Delivery:</strong> 3–5 business days after confirmation</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #f0f0f0;padding:20px 32px;text-align:center;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#111;">ENDER EXCLUSIVE</p>
      <p style="margin:0;font-size:12px;color:#888;">Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/contact" style="color:#e63946;">support page</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─────────────────────────────────────────────
// Admin notification email HTML
// ─────────────────────────────────────────────
function buildAdminEmail(order: any): string {
  const itemRows = order.items.map((item: any) => {
    const price = item.isOnSale ? (item.salePrice ?? item.price) : item.price;
    return `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${item.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;text-align:center;">${item.color || "-"} / ${item.size || "-"}</td>
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
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

    <!-- Admin header -->
    <div style="background:#1e293b;padding:24px 28px;">
      <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">ENDER EXCLUSIVE — ADMIN ALERT</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">🛒 New Order Received</h1>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:14px;">Order <strong style="color:#f1f5f9;">${order.orderNo}</strong> · ${new Date(order.orderDate).toLocaleString("en-LK")}</p>
    </div>

    <div style="padding:24px 28px;">

      <!-- Quick stats -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
        <div style="background:#fef3c7;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:11px;color:#92400e;font-weight:700;text-transform:uppercase;">Total</div>
          <div style="font-size:20px;font-weight:800;color:#92400e;margin-top:4px;">${rs(order.total)}</div>
        </div>
        <div style="background:#dbeafe;border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:11px;color:#1e40af;font-weight:700;text-transform:uppercase;">Items</div>
          <div style="font-size:20px;font-weight:800;color:#1e40af;margin-top:4px;">${order.items.reduce((s: number, i: any) => s + i.quantity, 0)}</div>
        </div>
        <div style="background:${order.paymentMethod === "bank" ? "#dbeafe" : "#dcfce7"};border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:11px;color:${order.paymentMethod === "bank" ? "#1e40af" : "#166534"};font-weight:700;text-transform:uppercase;">Payment</div>
          <div style="font-size:14px;font-weight:800;color:${order.paymentMethod === "bank" ? "#1e40af" : "#166534"};margin-top:4px;">${order.paymentMethod === "bank" ? "🏦 Bank" : "💵 COD"}</div>
        </div>
      </div>

      <!-- Customer info -->
      <h2 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">👤 Customer Details</h2>
      <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin-bottom:20px;font-size:13px;color:#334155;line-height:1.9;">
        <div><strong>Name:</strong> ${order.customerName}</div>
        <div><strong>Email:</strong> ${order.shippingAddress.email}</div>
        <div><strong>Phone:</strong> ${order.shippingAddress.phone}</div>
        <div><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.district} ${order.shippingAddress.postalCode || ""}</div>
        ${order.shippingAddress.notes ? `<div><strong>Notes:</strong> ${order.shippingAddress.notes}</div>` : ""}
      </div>

      <!-- Items -->
      <h2 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">📦 Ordered Items</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">
        <thead style="background:#f1f5f9;">
          <tr>
            <th style="padding:10px 14px;text-align:left;color:#64748b;font-weight:600;">Product</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-weight:600;">Variant</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-weight:600;">Qty</th>
            <th style="padding:10px 14px;text-align:right;color:#64748b;font-weight:600;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
          <span style="color:#64748b;">Subtotal</span><span style="font-weight:600;">${rs(order.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;font-size:13px;">
          <span style="color:#64748b;">Delivery</span><span style="font-weight:600;">${rs(order.deliveryCharge)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:16px;">
          <span style="font-weight:800;color:#1e293b;">Grand Total</span>
          <span style="font-weight:800;color:#e63946;">${rs(order.total)}</span>
        </div>
      </div>

      ${order.paymentProof ? `
      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
        <div style="font-size:13px;font-weight:700;color:#854d0e;margin-bottom:6px;">🧾 Payment Receipt Uploaded</div>
        <a href="${order.paymentProof}" style="color:#1d4ed8;font-size:13px;word-break:break-all;">View Receipt</a>
      </div>
      ` : ""}

      <!-- Admin CTA -->
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/orders"
           style="display:inline-block;background:#1e293b;color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;font-weight:700;font-size:14px;">
          View in Admin Dashboard →
        </a>
      </div>
    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 28px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">Ender Exclusive — Admin Notification System</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─────────────────────────────────────────────
// API Route
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order } = body;

    if (!order) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const customerEmail = order.shippingAddress?.email || order.userEmail;

    const results = await Promise.allSettled([
      // 1. Customer confirmation email
      resend.emails.send({
        from: FROM_EMAIL,
        to:   [customerEmail],
        subject: `✅ Order Confirmed — ${order.orderNo} | Ender Exclusive`,
        html: buildCustomerEmail(order),
      }),

      // 2. Admin notification email
      resend.emails.send({
        from: FROM_EMAIL,
        to:   [ADMIN_EMAIL],
        subject: `🛒 New Order: ${order.orderNo} — ${order.customerName} (Rs. ${order.total.toLocaleString()})`,
        html: buildAdminEmail(order),
      }),
    ]);

    const customerResult = results[0];
    const adminResult    = results[1];

    const response = {
      customer: customerResult.status === "fulfilled"
        ? { success: true,  id: (customerResult.value as any).data?.id }
        : { success: false, error: (customerResult as any).reason?.message },
      admin: adminResult.status === "fulfilled"
        ? { success: true,  id: (adminResult.value as any).data?.id }
        : { success: false, error: (adminResult as any).reason?.message },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
