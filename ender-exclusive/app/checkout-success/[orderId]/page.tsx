"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { PDFDownloadLink } from "@react-pdf/renderer";

import {
    HiOutlineCheckCircle,
    HiOutlineShoppingBag,
    HiOutlineMail,
    HiOutlineDownload,
} from "react-icons/hi";
import {
    FaTruck,
    FaShieldAlt,
    FaClock,
    FaBuilding,
    FaMoneyBillWave,
    FaFilePdf,
} from "react-icons/fa";

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
    const [countdown, setCountdown] = useState(5);

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

    useEffect(() => {
        if (!loading && order) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, order]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">
                        {authLoading ? "Checking authentication..." : "Loading order details..."}
                    </p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Order Not Found</h2>
                    <p className="text-gray-500 mt-2">We couldn't find your order</p>
                    <Link href="/shop" className="text-red-500 hover:underline mt-4 inline-block">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "processing": return "text-blue-600 bg-blue-50 border-blue-200";
            case "shipped": return "text-purple-600 bg-purple-50 border-purple-200";
            case "delivered": return "text-green-600 bg-green-50 border-green-200";
            case "cancelled": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending": return "Order Received";
            case "processing": return "Processing";
            case "shipped": return "Shipped";
            case "delivered": return "Delivered";
            case "cancelled": return "Cancelled";
            default: return status;
        }
    };

    const getPaymentText = (method: string) => {
        return method === "cod" ? "Cash on Delivery" : "Bank Transfer";
    };

    return (
        <div
            className="min-h-screen bg-gray-50 py-8 sm:py-12"
            suppressHydrationWarning
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8"
                    suppressHydrationWarning
                >
                    {/* Success Header */}
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <HiOutlineCheckCircle className="text-5xl text-green-500" />
                        </motion.div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Order Placed Successfully!
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Thank you for your order, {order.shippingAddress?.firstName || "Customer"}!
                        </p>

                        {/* Order Number */}
                        <div className="mt-4 inline-block bg-gray-100 rounded-xl px-6 py-3">
                            <p className="text-sm text-gray-500">Order Number</p>
                            <p className="text-xl font-bold text-gray-900 font-mono">
                                #{order.orderNo || orderId.slice(0, 8).toUpperCase()}
                            </p>
                        </div>

                        {/* Status */}
                        <div className={`mt-4 inline-block px-4 py-2 rounded-xl border ${getStatusColor(order.orderStatus || "pending")}`}>
                            <span className="font-medium">
                                Status: {getStatusText(order.orderStatus || "pending")}
                            </span>
                        </div>
                    </div>

                    {/* 🔥 PDF Download Button */}
                    <div className="mt-6 flex justify-center">
                        <PDFDownloadLink
                            document={<OrderReceiptPDF order={order} orderId={orderId} />}
                            fileName={`ENDER_Order_${order.orderNo || orderId.slice(0, 8).toUpperCase()}.pdf`}
                            className="inline-flex items-center gap-3 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition shadow-lg hover:shadow-red-500/30"
                        >
                            {({ loading }) => (
                                <>
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <FaFilePdf className="text-xl" />
                                            <span className="font-medium">Download Receipt (PDF)</span>
                                            <HiOutlineDownload className="text-xl" />
                                        </>
                                    )}
                                </>
                            )}
                        </PDFDownloadLink>
                    </div>

                    {/* Order Summary Grid */}
                    <div className="grid sm:grid-cols-3 gap-4 mt-6">
                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <HiOutlineShoppingBag className="text-red-500" />
                                Order Summary
                            </h3>
                            <div className="space-y-1.5 text-sm">
                                {order.items?.map((item: any, idx: number) => {
                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                    return (
                                        <div key={idx} className="flex justify-between">
                                            <span className="text-gray-600 truncate">
                                                {item.name} <span className="text-gray-400">×{item.quantity}</span>
                                            </span>
                                            <span className="font-medium">
                                                Rs. {(price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span>Rs. {order.subtotal?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery</span>
                                        <span>Rs. {order.deliveryCharge?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200">
                                        <span>Total</span>
                                        <span className="text-red-600">Rs. {order.total?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FaTruck className="text-blue-500" />
                                Shipping Address
                            </h3>
                            <div className="text-sm space-y-0.5">
                                <p className="font-medium text-gray-800">
                                    {order.shippingAddress?.fullName || order.shippingAddress?.firstName}
                                </p>
                                <p className="text-gray-600">{order.shippingAddress?.address}</p>
                                <p className="text-gray-600">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.district}
                                </p>
                                <p className="text-gray-600">Phone: {order.shippingAddress?.phone}</p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FaBuilding className="text-purple-500" />
                                Payment Method
                            </h3>
                            <div className="text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    {order.paymentMethod === "cod" ? (
                                        <FaMoneyBillWave className="text-green-600 text-lg" />
                                    ) : (
                                        <FaBuilding className="text-blue-600 text-lg" />
                                    )}
                                    <span className="font-medium">{getPaymentText(order.paymentMethod || "cod")}</span>
                                </div>
                                {order.paymentMethod === "bank" && (
                                    <div className="bg-blue-50 rounded-lg p-2 text-xs">
                                        <p className="text-blue-700">Payment Proof: {order.paymentProof ? "Uploaded ✓" : "Pending"}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                        <div className="grid sm:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">1</span>
                                <div>
                                    <p className="font-medium text-blue-800">Order Processing</p>
                                    <p className="text-blue-600 text-xs">We'll prepare your items</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">2</span>
                                <div>
                                    <p className="font-medium text-blue-800">Shipping</p>
                                    <p className="text-blue-600 text-xs">You'll get tracking info</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">3</span>
                                <div>
                                    <p className="font-medium text-blue-800">Delivery</p>
                                    <p className="text-blue-600 text-xs">
                                        Estimated: {order.delivery?.estimatedDays || 3} days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Email Confirmation */}
                    <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                        <HiOutlineMail className="text-lg text-green-500" />
                        <span>
                            {emailSent ? (
                                "✓ Order confirmation sent to " + order.userEmail
                            ) : (
                                "Loading order details..."
                            )}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/orders"
                            className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition text-center font-medium"
                        >
                            📦 View My Orders
                        </Link>
                        <Link
                            href="/shop"
                            className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition text-center font-medium"
                        >
                            🛍️ Continue Shopping
                        </Link>
                    </div>

                    {/* Auto Redirect */}
                    <div className="mt-4 text-center text-sm text-gray-400">
                        Redirecting to orders in {countdown} seconds...
                        <button
                            onClick={() => router.push("/orders")}
                            className="ml-2 text-red-500 hover:underline"
                        >
                            Go now
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <FaShieldAlt className="text-green-500 text-sm" />
                            <span>Secure Order</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaClock className="text-blue-500 text-sm" />
                            <span>Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaTruck className="text-orange-500 text-sm" />
                            <span>Easy Returns</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}