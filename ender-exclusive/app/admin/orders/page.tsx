"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import {
    HiOutlineShoppingBag,
    HiOutlineTruck,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
    HiOutlineSearch,
    HiOutlineLocationMarker,
    HiOutlineCreditCard,
    HiOutlineUser,
    HiOutlineFilter,
    HiOutlineDownload,
    HiOutlineCheck,
    HiOutlineX,
} from "react-icons/hi";
import {
    FaTruck,
    FaBuilding,
    FaMoneyBillWave,
    FaSpinner,
    FaCheck,
    FaBox,
    FaFileImage,
    FaTimes,
    FaDownload,
} from "react-icons/fa";

import { getAllOrders, updateOrderStatus, Order } from "@/services/orderService";

// 🔥 Animation Variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

export default function AdminOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterPayment, setFilterPayment] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

    // 🔥 Load orders
    useEffect(() => {
        const loadOrders = async () => {
            if (authLoading || !user) return;
            try {
                setLoading(true);
                setError(null);
                const data = await getAllOrders();
                setOrders(data);
            } catch (error: any) {
                setError(error.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [user, authLoading]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "pending_payment": return "bg-orange-50 text-orange-700 border-orange-200";
            case "processing": return "bg-blue-50 text-blue-700 border-blue-200";
            case "shipped": return "bg-purple-50 text-purple-700 border-purple-200";
            case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return <HiOutlineClock className="text-amber-600" />;
            case "pending_payment": return <HiOutlineClock className="text-orange-600" />;
            case "processing": return <HiOutlineTruck className="text-blue-600" />;
            case "shipped": return <FaTruck className="text-purple-600" />;
            case "delivered": return <HiOutlineCheckCircle className="text-emerald-600" />;
            case "cancelled": return <HiOutlineXCircle className="text-rose-600" />;
            default: return <HiOutlineClock className="text-gray-600" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending": return "Pending";
            case "pending_payment": return "Payment Pending";
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

    const getPaymentIcon = (method: string) => {
        return method === "cod" ? (
            <FaMoneyBillWave className="text-emerald-600" />
        ) : (
            <FaBuilding className="text-blue-600" />
        );
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus as Order["orderStatus"]);
            const data = await getAllOrders();
            setOrders(data);
            if (selectedOrder && selectedOrder.id === orderId) {
                const updatedOrder = data.find(o => o.id === orderId);
                if (updatedOrder) setSelectedOrder(updatedOrder);
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update order status");
        } finally {
            setUpdatingId(null);
        }
    };

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

    const handleViewReceipt = (order: Order) => {
        if (order.paymentProof) {
            setReceiptUrl(order.paymentProof);
            setShowReceipt(true);
        }
    };

    // 🔥 Filter orders
    const filteredOrders = orders.filter((order) => {
        const matchSearch =
            (order.orderNo || "").toLowerCase().includes(search.toLowerCase()) ||
            (order.userEmail || "").toLowerCase().includes(search.toLowerCase()) ||
            (order.customerName || "").toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || order.orderStatus === filterStatus;
        const matchPayment = filterPayment === "all" || order.paymentMethod === filterPayment;
        return matchSearch && matchStatus && matchPayment;
    });

    // 🔥 Stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.orderStatus === "pending" || o.orderStatus === "pending_payment").length,
        processing: orders.filter(o => o.orderStatus === "processing").length,
        shipped: orders.filter(o => o.orderStatus === "shipped").length,
        delivered: orders.filter(o => o.orderStatus === "delivered").length,
        cancelled: orders.filter(o => o.orderStatus === "cancelled").length,
        cod: orders.filter(o => o.paymentMethod === "cod").length,
        bank: orders.filter(o => o.paymentMethod === "bank").length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-500 font-medium">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* 🔥 Header */}
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
                    >
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                                Orders
                            </h1>
                            <p className="text-gray-500 mt-1">Manage all customer orders</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm bg-white px-5 py-2.5 rounded-2xl border border-gray-200 shadow-sm">
                                Total: {stats.total} orders
                            </span>
                            <span className="text-sm bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl border border-emerald-200">
                                Revenue: Rs. {stats.totalRevenue.toLocaleString()}
                            </span>
                        </div>
                    </motion.div>

                    {/* 🔥 Stats Cards */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
                    >
                        {[
                            { label: "Total", value: stats.total, color: "gray", icon: FaBox },
                            { label: "Pending", value: stats.pending, color: "amber", icon: HiOutlineClock },
                            { label: "Processing", value: stats.processing, color: "blue", icon: HiOutlineTruck },
                            { label: "Shipped", value: stats.shipped, color: "purple", icon: FaTruck },
                            { label: "Delivered", value: stats.delivered, color: "emerald", icon: HiOutlineCheckCircle },
                            { label: "Cancelled", value: stats.cancelled, color: "rose", icon: HiOutlineXCircle },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition"
                            >
                                <div className={`w-10 h-10 mx-auto rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-2`}>
                                    <stat.icon className={`text-xl text-${stat.color}-600`} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* 🔥 Search & Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm"
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by order #, email, or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="pending_payment">Payment Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    value={filterPayment}
                                    onChange={(e) => setFilterPayment(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white text-sm"
                                >
                                    <option value="all">All Payment</option>
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6"
                        >
                            <p className="text-rose-600 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* 🔥 Orders Table */}
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Order #
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.length > 0 ? (
                                        <AnimatePresence>
                                            {filteredOrders.map((order, index) => (
                                                <motion.tr
                                                    key={order.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.04 }}
                                                    whileHover={{ backgroundColor: "#f9fafb" }}
                                                    className="transition-colors duration-200"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono font-medium text-sm bg-gray-100 px-2 py-1 rounded-lg">
                                                            #{order.orderNo || order.id?.slice(0, 8).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {order.customerName || order.shippingAddress?.fullName || "N/A"}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{order.userEmail}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-gray-900">
                                                            Rs. {order.total?.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {getPaymentIcon(order.paymentMethod || "cod")}
                                                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${order.paymentMethod === "cod"
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : "bg-blue-100 text-blue-700"
                                                                }`}>
                                                                {getPaymentText(order.paymentMethod || "cod")}
                                                            </span>
                                                            {/* 🔥 Receipt View Button - Only for Bank Transfer with paymentProof */}
                                                            {order.paymentMethod === "bank" && order.paymentProof && (
                                                                <button
                                                                    onClick={() => handleViewReceipt(order)}
                                                                    className="text-xs text-blue-500 hover:text-blue-700 underline flex items-center gap-1"
                                                                >
                                                                    <FaFileImage className="text-xs" />
                                                                    Receipt
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(order.orderStatus || "pending")}
                                                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(order.orderStatus || "pending")}`}>
                                                                {getStatusText(order.orderStatus || "pending")}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleViewDetails(order)}
                                                                className="text-gray-400 hover:text-blue-600 transition p-1.5 hover:bg-blue-50 rounded-lg"
                                                                title="View Details"
                                                            >
                                                                <HiOutlineEye className="text-lg" />
                                                            </motion.button>
                                                            <select
                                                                value={order.orderStatus || "pending"}
                                                                onChange={(e) => handleStatusUpdate(order.id!, e.target.value)}
                                                                disabled={updatingId === order.id}
                                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none disabled:opacity-50 bg-white"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="pending_payment">Payment Pending</option>
                                                                <option value="processing">Processing</option>
                                                                <option value="shipped">Shipped</option>
                                                                <option value="delivered">Delivered</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                            {updatingId === order.id && (
                                                                <FaSpinner className="text-gray-500 animate-spin" />
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 200 }}
                                                    className="text-center"
                                                >
                                                    <HiOutlineShoppingBag className="text-6xl text-gray-200 mx-auto mb-4" />
                                                    <p className="text-gray-500 font-medium">No orders found</p>
                                                    {search && (
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            Try adjusting your search or filter
                                                        </p>
                                                    )}
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* 🔥 Order Details Modal */}
            <AnimatePresence>
                {showModal && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 30 }}
                            transition={{ duration: 0.3, type: "spring", damping: 25 }}
                            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10 rounded-t-3xl">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                    <p className="text-sm text-gray-500 font-mono">
                                        #{selectedOrder.orderNo || selectedOrder.id?.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={closeModal}
                                    className="p-2.5 hover:bg-gray-100 rounded-full transition"
                                >
                                    <HiOutlineX className="text-2xl text-gray-500" />
                                </motion.button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Status & Date */}
                                <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 rounded-2xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium border ${getStatusColor(
                                            selectedOrder.orderStatus || "pending"
                                        )}`}>
                                            {getStatusIcon(selectedOrder.orderStatus || "pending")}
                                            {getStatusText(selectedOrder.orderStatus || "pending")}
                                        </div>
                                        <select
                                            value={selectedOrder.orderStatus || "pending"}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                handleStatusUpdate(selectedOrder.id!, newStatus);
                                                setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as any });
                                            }}
                                            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none bg-white"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="pending_payment">Payment Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }) : "N/A"}
                                    </p>
                                </div>

                                {/* 🔥 Payment Info with Receipt View */}
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <HiOutlineCreditCard className="text-purple-500" />
                                        Payment Information
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div className="bg-white rounded-xl p-3">
                                            <span className="text-gray-400 text-xs">Method</span>
                                            <p className="font-medium text-gray-800 flex items-center gap-2">
                                                {getPaymentIcon(selectedOrder.paymentMethod || "cod")}
                                                {getPaymentText(selectedOrder.paymentMethod || "cod")}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3">
                                            <span className="text-gray-400 text-xs">Status</span>
                                            <p className={`font-medium ${selectedOrder.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                                                }`}>
                                                {selectedOrder.paymentStatus === "paid" ? "Paid ✓" : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 🔥 Receipt View Section */}
                                    {selectedOrder.paymentMethod === "bank" && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FaFileImage className="text-lg text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-700">
                                                        {selectedOrder.paymentProof ? "Receipt Uploaded ✓" : "No Receipt Uploaded"}
                                                    </span>
                                                </div>
                                                {selectedOrder.paymentProof && (
                                                    <button
                                                        onClick={() => handleViewReceipt(selectedOrder)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                                                    >
                                                        <HiOutlineEye className="text-sm" />
                                                        View Receipt
                                                    </button>
                                                )}
                                            </div>
                                            {selectedOrder.paymentProof && (
                                                <p className="text-xs text-blue-500 mt-1 truncate">
                                                    {selectedOrder.paymentProof}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Customer Info */}
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <HiOutlineUser className="text-blue-500" />
                                        Customer Information
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                        <div className="bg-white rounded-xl p-3">
                                            <span className="text-gray-400 text-xs">Name</span>
                                            <p className="font-medium text-gray-800">
                                                {selectedOrder.customerName || selectedOrder.shippingAddress?.fullName || "N/A"}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3">
                                            <span className="text-gray-400 text-xs">Email</span>
                                            <p className="font-medium text-gray-800">{selectedOrder.userEmail || "N/A"}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3">
                                            <span className="text-gray-400 text-xs">Phone</span>
                                            <p className="font-medium text-gray-800">{selectedOrder.shippingAddress?.phone || "N/A"}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3">
                                            <span className="text-gray-400 text-xs">Payment</span>
                                            <p className="font-medium text-gray-800 capitalize">{getPaymentText(selectedOrder.paymentMethod || "cod")}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <HiOutlineLocationMarker className="text-blue-500" />
                                        Shipping Address
                                    </h3>
                                    <div className="text-sm space-y-0.5 bg-white rounded-xl p-3">
                                        <p className="font-medium text-gray-800">
                                            {selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.firstName || "N/A"}
                                        </p>
                                        <p className="text-gray-600">{selectedOrder.shippingAddress?.address || "N/A"}</p>
                                        <p className="text-gray-600">
                                            {selectedOrder.shippingAddress?.city || ""}, {selectedOrder.shippingAddress?.district || ""}
                                        </p>
                                        <p className="text-gray-600">📞 {selectedOrder.shippingAddress?.phone || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item: any, idx: number) => {
                                            const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.05 * idx }}
                                                    className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition"
                                                >
                                                    <img
                                                        src={item.image || "/placeholder.png"}
                                                        alt={item.name}
                                                        className="w-14 h-14 rounded-xl object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                            <span>Color: {item.color || "N/A"}</span>
                                                            <span>Size: {item.size || "N/A"}</span>
                                                            <span>Qty: {item.quantity || 0}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">
                                                            Rs. {(price * (item.quantity || 0)).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gray-900 rounded-2xl p-5 text-white">
                                    <h3 className="font-semibold text-white/80 mb-3">Order Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Subtotal</span>
                                            <span className="font-medium">Rs. {selectedOrder.subtotal?.toLocaleString() || "0"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Delivery</span>
                                            <span className="font-medium">Rs. {selectedOrder.deliveryCharge?.toLocaleString() || "0"}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                                            <span>Total</span>
                                            <span className="text-white">Rs. {selectedOrder.total?.toLocaleString() || "0"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔥 Receipt Preview Modal */}
            <AnimatePresence>
                {showReceipt && receiptUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowReceipt(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
                                <h2 className="text-xl font-bold text-gray-900">Payment Receipt</h2>
                                <button
                                    onClick={() => setShowReceipt(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <HiOutlineX className="text-2xl text-gray-500" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                                    <p className="text-sm text-gray-500">Order #</p>
                                    <p className="font-mono font-bold">
                                        {selectedOrder?.orderNo || selectedOrder?.id?.slice(0, 8).toUpperCase() || "N/A"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Customer: {selectedOrder?.customerName || selectedOrder?.shippingAddress?.fullName || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                                    <img
                                        src={receiptUrl}
                                        alt="Payment Receipt"
                                        className="w-full rounded-xl max-h-[60vh] object-contain"
                                    />
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => window.open(receiptUrl, "_blank")}
                                        className="flex-1 bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        <FaDownload className="text-lg" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => setShowReceipt(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}