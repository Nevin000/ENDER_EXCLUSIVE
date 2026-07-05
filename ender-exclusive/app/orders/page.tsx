"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";

import {
    HiOutlineShoppingBag,
    HiOutlineTruck,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
    HiOutlineArrowRight,
    HiOutlineX,
    HiOutlineLocationMarker,
    HiOutlineCreditCard,
} from "react-icons/hi";
import { FaTruck, FaBuilding, FaMoneyBillWave, FaFilePdf } from "react-icons/fa";

import { getUserOrders, Order } from "@/services/orderService";
import { OrderReceiptPDF } from "@/components/OrderReceiptPDF";

export default function OrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            if (authLoading) return;
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const data = await getUserOrders(user.uid);
                setOrders(data);
            } catch (error) {
                console.error("Error loading orders:", error);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [user, router, authLoading]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
            case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
            case "delivered": return "bg-green-100 text-green-800 border-green-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return <HiOutlineClock className="text-yellow-600" />;
            case "processing": return <HiOutlineTruck className="text-blue-600" />;
            case "shipped": return <FaTruck className="text-purple-600" />;
            case "delivered": return <HiOutlineCheckCircle className="text-green-600" />;
            case "cancelled": return <HiOutlineXCircle className="text-red-600" />;
            default: return <HiOutlineClock className="text-gray-600" />;
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

    const filteredOrders =
        filter === "all"
            ? orders
            : orders.filter((order) => order.orderStatus === filter);

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowModal(true);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
        document.body.style.overflow = "auto";
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">
                        {authLoading ? "Checking authentication..." : "Loading orders..."}
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Please Login</h2>
                    <p className="text-gray-500 mt-2">You need to login to view your orders</p>
                    <Link
                        href="/login"
                        className="inline-block mt-6 bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition"
                    >
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-gray-500 mt-1">
                                {orders.length} {orders.length === 1 ? "order" : "orders"} placed
                            </p>
                        </div>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200"
                        >
                            <span>Continue Shopping</span>
                            <HiOutlineArrowRight className="text-lg" />
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(
                            (status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === status
                                            ? "bg-black text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                        }`}
                                >
                                    {status === "all"
                                        ? "All Orders"
                                        : getStatusText(status)}
                                    <span className="ml-1 text-xs">
                                        (
                                        {orders.filter((o) => status === "all" || o.orderStatus === status)
                                            .length}
                                        )
                                    </span>
                                </button>
                            )
                        )}
                    </div>

                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineShoppingBag className="text-4xl text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">No orders found</h3>
                            <p className="text-gray-500 mt-2">
                                {filter === "all"
                                    ? "You haven't placed any orders yet."
                                    : `No ${filter} orders found.`}
                            </p>
                            <Link
                                href="/shop"
                                className="inline-block mt-6 bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {filteredOrders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="p-6">
                                            {/* Order Header */}
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-gray-500">Order #</span>
                                                        <span className="font-mono font-bold text-gray-900">
                                                            {order.orderNo || order.id?.slice(0, 8).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(order.orderDate).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                            order.orderStatus || "pending"
                                                        )}`}
                                                    >
                                                        {getStatusIcon(order.orderStatus || "pending")}
                                                        {getStatusText(order.orderStatus || "pending")}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Items Preview */}
                                            <div className="border-t border-gray-100 pt-4">
                                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {order.items?.slice(0, 3).map((item: any, idx: number) => {
                                                        const price = item.isOnSale
                                                            ? item.salePrice ?? item.price
                                                            : item.price;
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                                                            >
                                                                <img
                                                                    src={item.image || "/placeholder.png"}
                                                                    alt={item.name}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                                        {item.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        ×{item.quantity} · Rs. {(price * item.quantity).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {order.items && order.items.length > 3 && (
                                                        <div className="flex items-center justify-center bg-gray-50 rounded-xl p-3 text-gray-400 text-sm">
                                                            +{order.items.length - 3} more items
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Order Footer */}
                                            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                                    <div>
                                                        <span className="text-gray-400">Total:</span>
                                                        <span className="ml-1 font-bold text-gray-900">
                                                            Rs. {order.total?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Payment:</span>
                                                        <span className="ml-1 capitalize">
                                                            {getPaymentText(order.paymentMethod || "cod")}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Items:</span>
                                                        <span className="ml-1">
                                                            {order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleViewDetails(order)}
                                                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100"
                                                >
                                                    <HiOutlineEye className="text-lg" />
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 Order Details Modal */}
            <AnimatePresence>
                {showModal && selectedOrder && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                                    <p className="text-sm text-gray-500">
                                        #{selectedOrder.orderNo || selectedOrder.id?.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <HiOutlineX className="text-2xl text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Status & Date */}
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                        selectedOrder.orderStatus || "pending"
                                    )}`}>
                                        {getStatusIcon(selectedOrder.orderStatus || "pending")}
                                        {getStatusText(selectedOrder.orderStatus || "pending")}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {new Date(selectedOrder.orderDate).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item: any, idx: number) => {
                                            const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-4 bg-gray-50 rounded-xl p-3"
                                                >
                                                    <img
                                                        src={item.image || "/placeholder.png"}
                                                        alt={item.name}
                                                        className="w-14 h-14 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                            <span>Color: {item.color}</span>
                                                            <span>Size: {item.size}</span>
                                                            <span>Qty: {item.quantity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">
                                                            Rs. {(price * item.quantity).toLocaleString()}
                                                        </p>
                                                        {item.isOnSale && (
                                                            <p className="text-xs text-red-500">
                                                                Saved Rs. {((item.price - price) * item.quantity).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <HiOutlineLocationMarker className="text-blue-500" />
                                        Shipping Address
                                    </h3>
                                    <div className="text-sm space-y-0.5">
                                        <p className="font-medium text-gray-800">
                                            {selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.firstName}
                                        </p>
                                        <p className="text-gray-600">{selectedOrder.shippingAddress?.address}</p>
                                        <p className="text-gray-600">
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}
                                        </p>
                                        <p className="text-gray-600">Phone: {selectedOrder.shippingAddress?.phone}</p>
                                    </div>
                                </div>

                                {/* Payment & Summary */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <HiOutlineCreditCard className="text-purple-500" />
                                            Payment Method
                                        </h3>
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2">
                                                {selectedOrder.paymentMethod === "cod" ? (
                                                    <FaMoneyBillWave className="text-green-600" />
                                                ) : (
                                                    <FaBuilding className="text-blue-600" />
                                                )}
                                                <span className="font-medium">
                                                    {getPaymentText(selectedOrder.paymentMethod || "cod")}
                                                </span>
                                            </div>
                                            {selectedOrder.paymentMethod === "bank" && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Payment Proof: {selectedOrder.paymentProof ? "✓ Uploaded" : "Pending"}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <HiOutlineShoppingBag className="text-red-500" />
                                            Order Summary
                                        </h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span className="font-medium">Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Delivery</span>
                                                <span className="font-medium">Rs. {selectedOrder.deliveryCharge?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200">
                                                <span>Total</span>
                                                <span className="text-red-600">Rs. {selectedOrder.total?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                                    <PDFDownloadLink
                                        document={<OrderReceiptPDF order={selectedOrder} orderId={selectedOrder.id || ""} />}
                                        fileName={`ENDER_Order_${selectedOrder.orderNo || selectedOrder.id?.slice(0, 8).toUpperCase()}.pdf`}
                                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition text-sm"
                                    >
                                        {({ loading }) => (
                                            <>
                                                {loading ? "Generating..." : <><FaFilePdf /> Download PDF</>}
                                            </>
                                        )}
                                    </PDFDownloadLink>
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}