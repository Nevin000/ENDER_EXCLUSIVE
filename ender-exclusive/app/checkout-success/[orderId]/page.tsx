"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

import {
    HiOutlineCheckCircle,
    HiOutlineShoppingBag,
    HiOutlineMail,
    HiOutlineDownload,
    HiOutlineLocationMarker,
    HiOutlinePhone,
    HiOutlineDocumentText,
    HiOutlineEye,
} from "react-icons/hi";
import {
    FaTruck,
    FaShieldAlt,
    FaClock,
    FaBuilding,
    FaMoneyBillWave,
    FaFilePdf,
} from "react-icons/fa";
import { Flame, ArrowRight, CheckCircle2, Calendar, MapPin, User, Mail, Phone, ExternalLink } from "lucide-react";

import { getOrderById, Order } from "@/services/orderService";
import { OrderReceiptPDF } from "@/components/OrderReceiptPDF";

export default function OrderSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [emailSent, setEmailSent] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            if (authLoading) return;
            if (!orderId) return;
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const data = await getOrderById(orderId);
                if (data) {
                    setOrder(data);
                    setEmailSent(true);
                } else {
                    router.push("/orders");
                }
            } catch (error) {
                console.error("Error loading order:", error);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [orderId, user, router, authLoading]);

    // Countdown timer
    useEffect(() => {
        if (!loading && order && !isPaused && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, order, isPaused, countdown]);

    // Handle auto-redirect safely outside of render/state-updater
    useEffect(() => {
        if (countdown === 0 && !loading && order && !isPaused) {
            router.push("/orders");
        }
    }, [countdown, loading, order, isPaused, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300">
                <div className="text-center space-y-4">
                    <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-black uppercase tracking-widest text-red-500">
                        {authLoading ? "Verifying Authentication..." : "Loading Order Details..."}
                    </p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#070707] text-zinc-900 dark:text-white px-4 transition-colors duration-300">
                <div className="text-center max-w-md bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-lg space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Order Not Found</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">We could not locate this order record.</p>
                    <Link href="/shop" className="inline-block bg-red-600 text-white font-black uppercase tracking-widest text-xs px-8 py-3.5 rounded-full hover:bg-red-500 transition-all shadow-md">
                        Return to Store Catalog
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "text-amber-500 bg-amber-500/10 border-amber-500/30";
            case "processing": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
            case "shipped": return "text-purple-500 bg-purple-500/10 border-purple-500/30";
            case "delivered": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
            case "cancelled": return "text-red-500 bg-red-500/10 border-red-500/30";
            default: return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending": return "Order Received & Pending Processing";
            case "processing": return "Items Being Prepared";
            case "shipped": return "Dispatched via Courier";
            case "delivered": return "Delivered to Customer";
            case "cancelled": return "Order Cancelled";
            default: return status;
        }
    };

    const formattedOrderDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="min-h-screen bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300 py-8 sm:py-12 lg:py-16 pb-28">
            <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-zinc-50 dark:bg-[#111111] rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 lg:p-12 space-y-8"
                >
                    {/* ===== 1. SUCCESS BANNER HEADER ===== */}
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-500/20"
                        >
                            <HiOutlineCheckCircle className="text-5xl" />
                        </motion.div>

                        <div className="space-y-1">
                            <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-500">
                                PAYMENT & ORDER CONFIRMED
                            </span>
                            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                                Order Placed Successfully!
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                Thank you for your purchase, <span className="text-zinc-900 dark:text-white font-bold">{order.shippingAddress?.fullName || order.shippingAddress?.firstName || order.customerName || "Valued Customer"}</span>!
                            </p>
                        </div>

                        {/* Order Number & Timestamp Pill */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <div className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-3 text-center shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Reference No.</p>
                                <p className="text-xl font-black text-red-600 dark:text-red-500 font-mono tracking-wider">
                                    #{order.orderNo || orderId.slice(0, 8).toUpperCase()}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-3 text-center shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Date & Time</p>
                                <p className="text-xs font-black text-zinc-900 dark:text-white">
                                    {formattedOrderDate}
                                </p>
                            </div>
                        </div>

                        {/* Order Status Badge */}
                        <div className="pt-1">
                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-black uppercase tracking-wider ${getStatusColor(order.orderStatus || "pending")}`}>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Status: {getStatusText(order.orderStatus || "pending")}</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== 2. PDF RECEIPT DOWNLOAD CTA ===== */}
                    <div className="flex justify-center pt-2">
                        <PDFDownloadLink
                            document={<OrderReceiptPDF order={order} orderId={orderId} />}
                            fileName={`ENDER_Order_${order.orderNo || orderId.slice(0, 8).toUpperCase()}.pdf`}
                            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full transition-all duration-300 shadow-xl hover:scale-105"
                        >
                            {({ loading: pdfLoading }) => (
                                <>
                                    {pdfLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Generating PDF Receipt...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaFilePdf className="text-base" />
                                            <span>Download Official PDF Receipt</span>
                                            <HiOutlineDownload className="text-base" />
                                        </>
                                    )}
                                </>
                            )}
                        </PDFDownloadLink>
                    </div>

                    {/* ===== 3. DETAILED ORDER INFORMATION GRID ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        
                        {/* CARD 1: ORDER ITEMS BREAKDOWN */}
                        <div className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm md:col-span-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                <HiOutlineShoppingBag className="text-lg" />
                                <span>Purchased Items ({order.items?.length || 0})</span>
                            </div>

                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {order.items?.map((item: any, idx: number) => {
                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                    const specs = [item.color, item.size].filter(Boolean).join(" / ");
                                    return (
                                        <div key={idx} className="flex items-center gap-3 text-xs border-b border-zinc-100 dark:border-zinc-800/80 pb-3 last:border-0 last:pb-0">
                                            <img
                                                src={item.image || "/lookbook/look_book_banner.avif"}
                                                alt={item.name}
                                                className="w-12 h-14 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-zinc-900 dark:text-white truncate">
                                                    {item.name}
                                                </h4>
                                                {specs && (
                                                    <p className="text-[10px] text-zinc-400 font-bold">
                                                        {specs}
                                                    </p>
                                                )}
                                                <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                                                    Rs. {price.toLocaleString()} × {item.quantity}
                                                </p>
                                            </div>
                                            <span className="font-black text-red-600 dark:text-red-500 text-xs shrink-0">
                                                Rs. {(price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-1.5 text-xs font-bold">
                                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                    <span>Items Subtotal</span>
                                    <span className="font-black text-zinc-900 dark:text-white">Rs. {order.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                    <span>Delivery Charge</span>
                                    <span className="font-black text-amber-500">
                                        {order.deliveryCharge === 0 ? "FREE" : `Rs. ${order.deliveryCharge?.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between font-black text-sm pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                                    <span>Grand Total</span>
                                    <span className="text-red-600 dark:text-red-500 text-base">Rs. {order.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: SHIPPING ADDRESS DETAILS */}
                        <div className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm md:col-span-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-500 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                <FaTruck className="text-base" />
                                <span>Shipping Address</span>
                            </div>

                            <div className="text-xs space-y-2 font-medium leading-relaxed">
                                <div className="flex items-center gap-2 font-black text-sm text-zinc-900 dark:text-white">
                                    <User className="w-4 h-4 text-blue-500" />
                                    <span>{order.shippingAddress?.fullName || `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() || order.customerName}</span>
                                </div>

                                <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p>{order.shippingAddress?.address}</p>
                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.district} {order.shippingAddress?.postalCode}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 pt-1">
                                    <Phone className="w-4 h-4 text-blue-500" />
                                    <span>Phone: {order.shippingAddress?.phone}</span>
                                </div>

                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    <span className="truncate">Email: {order.shippingAddress?.email || order.userEmail}</span>
                                </div>

                                {order.shippingAddress?.notes && (
                                    <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 mt-2">
                                        <p className="text-[10px] font-black uppercase text-blue-500">Delivery Instructions:</p>
                                        <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">{order.shippingAddress.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CARD 3: PAYMENT DETAILS & RECEIPT PREVIEW */}
                        <div className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm md:col-span-1">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-500 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                <FaBuilding className="text-base" />
                                <span>Payment & Slip Details</span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center gap-2.5">
                                    {order.paymentMethod === "cod" ? (
                                        <FaMoneyBillWave className="text-emerald-500 text-lg" />
                                    ) : (
                                        <FaBuilding className="text-amber-500 text-lg" />
                                    )}
                                    <div>
                                        <span className="font-black text-sm uppercase text-zinc-900 dark:text-white">
                                            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Direct Bank Deposit"}
                                        </span>
                                        <p className="text-[11px] text-zinc-400 font-semibold">
                                            {order.paymentMethod === "cod" ? "Pay upon parcel receipt" : "Bank Transfer to Ender Exclusive"}
                                        </p>
                                    </div>
                                </div>

                                {order.paymentMethod === "bank" && (
                                    <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                                            <span>Bank Receipt Slip</span>
                                            <span>{order.paymentProof ? "Uploaded ✓" : "Pending Verification"}</span>
                                        </div>

                                        {order.paymentProof && (
                                            <div className="pt-1 flex items-center gap-3">
                                                <img
                                                    src={order.paymentProof}
                                                    alt="Bank Slip Preview"
                                                    className="w-14 h-14 rounded-xl object-cover border border-amber-500/30 bg-white"
                                                />
                                                <a
                                                    href={order.paymentProof}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-black text-amber-500 hover:underline"
                                                >
                                                    <span>View Slip Image</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* ===== 4. DISPATCH & FULFILLMENT STEPS ===== */}
                    <div className="bg-white dark:bg-[#181818] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
                            Fulfillment Journey
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800">
                                <span className="w-7 h-7 rounded-xl bg-red-600 text-white font-black flex items-center justify-center shrink-0">1</span>
                                <div>
                                    <p className="font-black text-sm uppercase text-zinc-900 dark:text-white">Order Processing</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] mt-0.5">Your items are being quality checked</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800">
                                <span className="w-7 h-7 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center shrink-0">2</span>
                                <div>
                                    <p className="font-black text-sm uppercase text-zinc-900 dark:text-white">Courier Dispatch</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] mt-0.5">Handed over for islandwide delivery</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800">
                                <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center shrink-0">3</span>
                                <div>
                                    <p className="font-black text-sm uppercase text-zinc-900 dark:text-white">Doorstep Delivery</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] mt-0.5">Estimated 2-3 business days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== 5. EMAIL NOTIFICATION NOTICE ===== */}
                    <div className="text-center text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                        <HiOutlineMail className="text-xl text-emerald-500" />
                        <span>
                            {emailSent ? (
                                `✓ Order receipt notification sent to ${order.userEmail || order.shippingAddress?.email}`
                            ) : (
                                "Sending order receipt notification..."
                            )}
                        </span>
                    </div>

                    {/* ===== 6. USER ACTION BUTTONS ===== */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Link
                            href="/orders"
                            className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl transition-all text-center shadow-lg"
                        >
                            📦 View My Orders History
                        </Link>
                        <Link
                            href="/shop"
                            className="flex-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl transition-all text-center"
                        >
                            🛍️ Continue Store Shopping
                        </Link>
                    </div>

                    {/* ===== 7. REDIRECT CONTROL BAR ===== */}
                    <div className="text-center text-xs font-bold text-zinc-400 flex items-center justify-center gap-3">
                        <span>
                            {isPaused
                                ? "Auto-redirect paused."
                                : `Auto-redirecting to My Orders in ${countdown}s...`}
                        </span>
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-black text-[10px] uppercase hover:bg-zinc-300 transition"
                        >
                            {isPaused ? "Resume Auto-Redirect" : "Pause Redirect"}
                        </button>
                        <button
                            onClick={() => router.push("/orders")}
                            className="text-red-500 font-black hover:underline"
                        >
                            Go Now →
                        </button>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}