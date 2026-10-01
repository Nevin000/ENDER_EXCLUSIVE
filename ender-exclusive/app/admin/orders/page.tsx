"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "@/components/admin/AnimatedCounter";

import {
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineCreditCard,
  HiOutlineUser,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineBanknotes,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";

import {
  FaTruck,
  FaBuilding,
  FaMoneyBillWave,
  FaSpinner,
  FaBox,
  FaFileImage,
  FaDownload,
} from "react-icons/fa";

import { getAllOrders, updateOrderStatus, updateOrderDeliveryDetails, Order } from "@/services/orderService";

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function AdminOrdersPage() {
  const { adminUser: user, adminLoading: authLoading } = useAdminAuth();
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

  // Tracking popup state
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [deliveryCompanyInput, setDeliveryCompanyInput] = useState("");
  const [deliveryNotesInput, setDeliveryNotesInput] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  // Load orders
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50";
      case "pending_payment":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/50";
      case "processing":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50";
      case "cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50";
      default:
        return "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-700/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <HiOutlineClock className="w-5 h-5 text-amber-500" />;
      case "pending_payment":
        return <HiOutlineClock className="w-5 h-5 text-orange-500" />;
      case "processing":
        return <HiOutlineTruck className="w-5 h-5 text-blue-500" />;
      case "delivered":
        return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />;
      case "cancelled":
        return <HiOutlineXCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <HiOutlineClock className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "pending_payment":
        return "Payment Pending";
      case "processing":
        return "Processing";
      case "delivered":
        return "Hand Over Delivery";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPaymentText = (method: string) => {
    return method === "cod" ? "Cash on Delivery" : "Bank Transfer";
  };

  const getPaymentIcon = (method: string) => {
    return method === "cod" ? (
      <FaMoneyBillWave className="text-emerald-500 text-base" />
    ) : (
      <FaBuilding className="text-blue-500 text-base" />
    );
  };

  const openDeliveryModal = (order: Order) => {
    setTrackingOrder(order);
    setTrackingNumberInput(order.trackingNumber || "");
    setDeliveryCompanyInput(order.deliveryCompany || "");
    setDeliveryNotesInput(order.deliveryNotes || "");
    setShowTrackingModal(true);
  };

  const closeDeliveryModal = () => {
    setShowTrackingModal(false);
    setTrackingOrder(null);
    setTrackingNumberInput("");
    setDeliveryCompanyInput("");
    setDeliveryNotesInput("");
  };

  const handleSaveDeliveryDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingOrder) return;
    if (!deliveryCompanyInput.trim()) {
      alert("Please enter the Delivery Company Name");
      return;
    }
    if (!trackingNumberInput.trim()) {
      alert("Please enter the Tracking Number");
      return;
    }

    setSavingTracking(true);
    try {
      await updateOrderDeliveryDetails(trackingOrder.id!, {
        orderStatus: "delivered",
        trackingNumber: trackingNumberInput.trim(),
        deliveryCompany: deliveryCompanyInput.trim(),
        deliveryNotes: deliveryNotesInput.trim(),
      });
      const data = await getAllOrders();
      setOrders(data);
      if (selectedOrder && selectedOrder.id === trackingOrder.id) {
        const updatedOrder = data.find((o) => o.id === trackingOrder.id);
        if (updatedOrder) setSelectedOrder(updatedOrder);
      }
      closeDeliveryModal();
      alert("Hand Over Delivery details saved successfully!");
    } catch (error: any) {
      console.error("Error saving delivery details:", error);
      alert("Failed to save delivery details. Please try again.");
    } finally {
      setSavingTracking(false);
    }
  };

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    if (newStatus === "delivered") {
      openDeliveryModal(order);
      return;
    }

    setUpdatingId(order.id!);
    try {
      await updateOrderStatus(order.id!, newStatus as Order["orderStatus"]);
      const data = await getAllOrders();
      setOrders(data);
      if (selectedOrder && selectedOrder.id === order.id) {
        const updatedOrder = data.find((o) => o.id === order.id);
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

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      (order.orderNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (order.userEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (order.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || order.orderStatus === filterStatus;
    const matchPayment = filterPayment === "all" || order.paymentMethod === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  // Computed Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(
      (o) => o.orderStatus === "pending" || o.orderStatus === "pending_payment"
    ).length,
    processing: orders.filter((o) => o.orderStatus === "processing").length,
    delivered: orders.filter((o) => o.orderStatus === "delivered").length,
    cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    totalRevenue: orders
      .filter((o) => o.orderStatus !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  if (authLoading || loading) {
    return (
      <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans">
        <div className="relative bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl border border-white/20 dark:border-[#2A2A2A]/60 rounded-3xl p-16 text-center shadow-2xl shadow-black/5">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-base font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      {/* ===== HEADER SECTION ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0D0D0D] border border-white/30 dark:border-[#2A2A2A]/50 shadow-2xl shadow-black/5 p-6 md:p-8">
        {/* Decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">
              <span>Portal</span>
              <HiOutlineChevronRight className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-900 dark:text-white font-extrabold">Orders</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              Orders <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              Fulfill pending transactions, view payment proofs, track shipments, and manage store revenue.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-2xl px-6 py-4 shadow-lg shadow-black/5">
              <span className="block text-sm font-extrabold uppercase tracking-wider text-zinc-400">Total Revenue</span>
              <span className="text-3xl lg:text-4xl font-black text-amber-500 dark:text-amber-400 font-mono">
                Rs. {stats.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STAT CARDS SUMMARY GRID ===== */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5"
      >
        {[
          { label: "Total Orders", value: stats.total, icon: FaBox, gradient: "from-zinc-400 to-zinc-600" },
          { label: "Pending", value: stats.pending, icon: HiOutlineClock, gradient: "from-amber-400 to-orange-500" },
          { label: "Processing", value: stats.processing, icon: HiOutlineTruck, gradient: "from-blue-400 to-indigo-500" },
          { label: "Hand Over Delivery", value: stats.delivered, icon: HiOutlineCheckCircle, gradient: "from-emerald-400 to-teal-500" },
          { label: "Cancelled", value: stats.cancelled, icon: HiOutlineXCircle, gradient: "from-rose-400 to-red-500" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={fadeInUp}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="relative group bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-5 shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white font-mono mt-3">
              <AnimatedCounter value={stat.value} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== SEARCH & FILTERS RIBBON ===== */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Search Box */}
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order #, customer name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 dark:focus:border-amber-500/50 rounded-2xl text-base font-bold text-zinc-900 dark:text-white outline-none transition-all duration-300 shadow-inner shadow-black/5 focus:shadow-amber-500/10"
            />
          </div>

          {/* Status & Payment Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 dark:focus:border-amber-500/50 rounded-2xl px-5 py-4 text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white outline-none cursor-pointer transition-all duration-300 shadow-inner shadow-black/5"
            >
              <option value="all">All Statuses</option>
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
              className="bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 dark:focus:border-amber-500/50 rounded-2xl px-5 py-4 text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white outline-none cursor-pointer transition-all duration-300 shadow-inner shadow-black/5"
            >
              <option value="all">All Payments</option>
              <option value="cod">Cash on Delivery</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-300 p-5 rounded-2xl text-sm font-extrabold uppercase tracking-wider flex items-center gap-3"
        >
          <HiOutlineXCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      {/* ===== ORDERS DATA TABLE ===== */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-zinc-50/80 to-zinc-100/80 dark:from-[#1A1A1A]/80 dark:to-[#0D0D0D]/80 border-b border-zinc-200/60 dark:border-zinc-800/60 text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Total</th>
                <th className="px-6 py-5">Payment</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/60 dark:divide-zinc-800/40 text-base font-normal">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    className="group transition-colors duration-200 dark:hover:bg-white/5"
                  >
                    {/* Order ID */}
                    <td className="px-6 py-5">
                      <span className="font-mono text-base font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-3.5 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50">
                        #{order.orderNo || order.id?.slice(0, 8).toUpperCase()}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-medium text-base sm:text-lg text-zinc-900 dark:text-white">
                          {order.customerName || order.shippingAddress?.fullName || "Guest"}
                        </p>
                        <p className="text-sm font-normal text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{order.userEmail}</p>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-5">
                      <span className="font-mono font-medium text-base sm:text-lg text-zinc-900 dark:text-white">
                        Rs. {order.total?.toLocaleString()}
                      </span>
                    </td>

                    {/* Payment Info */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {getPaymentIcon(order.paymentMethod || "cod")}
                        <span className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white">
                          {getPaymentText(order.paymentMethod || "cod")}
                        </span>

                        {order.paymentMethod === "bank" && order.paymentProof && (
                          <button
                            onClick={() => handleViewReceipt(order)}
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200/60 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition cursor-pointer"
                          >
                            <FaFileImage className="w-4 h-4" />
                            <span>Proof</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider border ${getStatusBadgeStyle(
                          order.orderStatus || "pending"
                        )} shadow-sm`}
                      >
                        {getStatusIcon(order.orderStatus || "pending")}
                        <span>{getStatusText(order.orderStatus || "pending")}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2.5 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-2xl hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition cursor-pointer border border-white/20 dark:border-zinc-700/50 shadow-sm"
                          title="View Full Order Details"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>

                        <select
                          value={order.orderStatus || "pending"}
                          onChange={(e) => handleStatusUpdate(order, e.target.value)}
                          disabled={updatingId === order.id}
                          className="text-xs font-semibold uppercase bg-zinc-100/80 dark:bg-[#1A1A1A]/80 border border-white/20 dark:border-zinc-700/50 rounded-2xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none cursor-pointer disabled:opacity-50 transition-all duration-200 hover:border-amber-400/50 dark:hover:border-amber-500/50 shadow-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="pending_payment">Payment Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Hand Over Delivery</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {updatingId === order.id && (
                          <FaSpinner className="w-5 h-5 text-amber-500 animate-spin" />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="w-16 h-16 mx-auto bg-zinc-100/80 dark:bg-zinc-800/80 rounded-3xl flex items-center justify-center border border-white/20 dark:border-zinc-700/50 shadow-sm">
                        <HiOutlineShoppingBag className="w-8 h-8 text-zinc-400" />
                      </div>
                      <p className="text-lg font-extrabold text-zinc-900 dark:text-white">No Orders Found</p>
                      <p className="text-sm text-zinc-400">Adjust your search or filters</p>
                    </motion.div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FULL ORDER DETAILS MODAL ===== */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/90 dark:bg-[#141414]/90 backdrop-blur-2xl border border-white/30 dark:border-zinc-800/60 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 px-8 py-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white">
                    Order #{selectedOrder.orderNo || selectedOrder.id?.slice(0, 8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-zinc-400 font-mono mt-1">
                    {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : "N/A"}
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full transition bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <HiOutlineXMark className="w-7 h-7" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* Status Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/20 dark:border-zinc-800/60 rounded-2xl shadow-inner shadow-black/5">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-extrabold uppercase border ${getStatusBadgeStyle(selectedOrder.orderStatus || "pending")} shadow-sm`}>
                      {getStatusText(selectedOrder.orderStatus || "pending")}
                    </span>

                    <select
                      value={selectedOrder.orderStatus || "pending"}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        handleStatusUpdate(selectedOrder, newStatus);
                      }}
                      className="text-sm font-extrabold uppercase bg-white/80 dark:bg-[#1A1A1A]/80 border border-white/20 dark:border-zinc-700/50 rounded-2xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none cursor-pointer transition-all hover:border-amber-400/50 dark:hover:border-amber-500/50 shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="pending_payment">Payment Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Hand Over Delivery</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <span className="text-base font-black text-amber-500 dark:text-amber-400 font-mono">
                    Total: Rs. {selectedOrder.total?.toLocaleString()}
                  </span>
                </div>

                {/* Delivery & Tracking Details Card */}
                <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl shadow-inner space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <FaTruck className="w-4 h-4" />
                      Hand Over Delivery & Tracking Details
                    </h3>
                    <button
                      onClick={() => openDeliveryModal(selectedOrder)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30 transition cursor-pointer"
                    >
                      {selectedOrder.trackingNumber ? "Edit Tracking Info" : "+ Add Tracking Info"}
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">Delivery Company</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-base">
                        {selectedOrder.deliveryCompany || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">Tracking / Waybill No</span>
                      <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-base">
                        {selectedOrder.trackingNumber || "N/A"}
                      </span>
                    </div>
                    {selectedOrder.handoverDate && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">Handover Date</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {new Date(selectedOrder.handoverDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                    {selectedOrder.deliveryNotes && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">Notes</span>
                        <span className="font-normal text-zinc-600 dark:text-zinc-300">
                          {selectedOrder.deliveryNotes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer & Payment Grid */}
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Customer Card */}
                  <div className="p-5 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/20 dark:border-zinc-800/60 rounded-2xl shadow-inner shadow-black/5 space-y-2">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <HiOutlineUser className="w-5 h-5 text-blue-500" />
                      Customer
                    </h3>
                    <p className="font-extrabold text-lg text-zinc-900 dark:text-white">
                      {selectedOrder.customerName || selectedOrder.shippingAddress?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-zinc-400 font-mono">{selectedOrder.userEmail || "N/A"}</p>
                    <p className="text-sm text-zinc-400 font-mono">📞 {selectedOrder.shippingAddress?.phone || "N/A"}</p>
                  </div>

                  {/* Payment Card */}
                  <div className="p-5 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/20 dark:border-zinc-800/60 rounded-2xl shadow-inner shadow-black/5 space-y-2">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <HiOutlineCreditCard className="w-5 h-5 text-purple-500" />
                      Payment
                    </h3>
                    <p className="font-extrabold text-lg text-zinc-900 dark:text-white capitalize">
                      {getPaymentText(selectedOrder.paymentMethod || "cod")}
                    </p>
                    <p className={`text-sm font-extrabold uppercase ${selectedOrder.paymentStatus === "paid" ? "text-emerald-500" : "text-amber-500"}`}>
                      {selectedOrder.paymentStatus === "paid" ? "Paid ✓" : "Pending"}
                    </p>

                    {selectedOrder.paymentMethod === "bank" && selectedOrder.paymentProof && (
                      <button
                        onClick={() => handleViewReceipt(selectedOrder)}
                        className="mt-2 w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-sm font-extrabold uppercase rounded-2xl hover:from-amber-500 hover:to-amber-600 transition-all duration-300 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                      >
                        <FaFileImage className="w-4 h-4" />
                        <span>View Bank Proof</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-5 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/20 dark:border-zinc-800/60 rounded-2xl shadow-inner shadow-black/5 space-y-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <HiOutlineMapPin className="w-5 h-5 text-emerald-500" />
                    Delivery Address
                  </h3>
                  <p className="font-bold text-base text-zinc-900 dark:text-white">
                    {selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.firstName || "N/A"}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedOrder.shippingAddress?.address || "N/A"}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {selectedOrder.shippingAddress?.city || ""}, {selectedOrder.shippingAddress?.district || ""}
                  </p>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
                    Items ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, idx: number) => {
                      const itemPrice = item.isOnSale ? item.salePrice ?? item.price : item.price;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/20 dark:border-zinc-800/60 rounded-2xl shadow-inner shadow-black/5"
                        >
                          <img
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            className="w-14 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700/50"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-base text-zinc-900 dark:text-white line-clamp-1">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                              <span>Color: {item.color || "N/A"}</span>
                              <span>Size: {item.size || "N/A"}</span>
                              <span>Qty: {item.quantity || 0}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-zinc-900 dark:text-white font-mono">
                              Rs. {(itemPrice * (item.quantity || 0)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary Breakdown */}
                <div className="p-6 bg-gradient-to-br from-zinc-900 to-black dark:from-black dark:to-zinc-900 rounded-3xl text-white space-y-3 font-mono shadow-2xl shadow-black/30">
                  <div className="flex justify-between text-sm font-bold text-zinc-400">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.subtotal?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-400">
                    <span>Delivery</span>
                    <span>Rs. {selectedOrder.deliveryCharge?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-amber-400 pt-3 border-t border-zinc-700/50">
                    <span>Total</span>
                    <span>Rs. {selectedOrder.total?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== HAND OVER DELIVERY TRACKING POPUP MODAL ===== */}
      <AnimatePresence>
        {showTrackingModal && trackingOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={closeDeliveryModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-[#141414] text-zinc-900 dark:text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                    <FaTruck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Hand Over Delivery</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                      Order #{trackingOrder.orderNo || trackingOrder.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDeliveryModal}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
                >
                  <HiOutlineXMark className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSaveDeliveryDetails} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Delivery / Courier Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prompt Express, DHL, Domex, Pronto"
                    value={deliveryCompanyInput}
                    onChange={(e) => setDeliveryCompanyInput(e.target.value)}
                    className="w-full px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl text-sm font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Tracking Number / Waybill ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PR-984729104, DHL-849201"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    className="w-full px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl text-sm font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Delivery Notes / Instructions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Handed over to courier agent. Expected delivery in 2-3 business days."
                    value={deliveryNotesInput}
                    onChange={(e) => setDeliveryNotesInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={closeDeliveryModal}
                    className="flex-1 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-xs rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTracking}
                    className="flex-1 py-3.5 bg-amber-500 text-black font-extrabold uppercase tracking-wider text-xs rounded-full hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingTracking ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save & Hand Over</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== PAYMENT RECEIPT PROOF MODAL ===== */}
      <AnimatePresence>
        {showReceipt && receiptUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
            onClick={() => setShowReceipt(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              className="bg-white/90 dark:bg-[#141414]/90 backdrop-blur-2xl border border-white/30 dark:border-zinc-800/60 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/30 p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">Payment Proof</h3>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                >
                  <HiOutlineXMark className="w-7 h-7" />
                </button>
              </div>

              <div className="p-4 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 rounded-2xl text-center border border-white/20 dark:border-zinc-800/60">
                <img
                  src={receiptUrl}
                  alt="Payment Receipt"
                  className="max-h-[60vh] mx-auto object-contain rounded-xl shadow-md"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => window.open(receiptUrl, "_blank")}
                  className="flex-1 py-3.5 bg-gradient-to-r from-zinc-900 to-black dark:from-white dark:to-zinc-200 text-white dark:text-black rounded-2xl text-sm font-extrabold uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-black/20"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>Open Full</span>
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-8 py-3.5 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-2xl text-sm font-extrabold uppercase tracking-wider hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition border border-white/20 dark:border-zinc-700/50 shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}