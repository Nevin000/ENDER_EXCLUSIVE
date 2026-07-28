"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  ShoppingBag,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  X,
  MapPin,
  CreditCard,
  FileText,
  Package,
  Calendar,
  Sparkles,
} from "lucide-react";

import { getUserOrders, Order } from "@/services/orderService";

const OrderPDFDownloadButton = dynamic(
  () => import("@/components/OrderPDFDownloadButton"),
  { ssr: false }
);

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
        console.error("Error loading customer orders:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user, router, authLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "processing":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Received";
      case "processing":
        return "In Processing";
      case "delivered":
        return "Handed To Courier";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPaymentText = (method: string) => {
    return method === "cod" ? "Cash on Delivery" : "Bank Deposit / Transfer";
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
      <div className="min-h-screen bg-white dark:bg-[#070707] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {authLoading ? "Verifying Account Access..." : "Loading Order History..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center px-4 py-24">
        <div className="text-center space-y-6 max-w-md bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-xl">
          <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 w-fit mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight">Please Sign In</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              You must be logged in to view your order history and tracking statuses.
            </p>
          </div>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-amber-300 transition shadow-xl hover:scale-105"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300 pb-32">
      
      {/* ===== HERO BANNER SECTION ===== */}
      <section className="relative bg-[#070707] text-white py-16 sm:py-24 border-b border-zinc-800/80 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              <span>CUSTOMER ORDER PORTAL</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
              My <span className="text-amber-400">Order History</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base font-medium max-w-xl">
              Track your active Sri Lanka courier dispatches, view invoice details, and download official PDF order receipts.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest transition shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <span>Explore Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BREADCRUMB BAR ===== */}
      <div className="bg-zinc-50 dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800 py-3.5">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-bold">My Orders ({orders.length})</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-8">
        
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {["all", "pending", "processing", "delivered", "cancelled"].map((status) => {
            const isActive = filter === status;
            const count = orders.filter((o) => status === "all" || o.orderStatus === status).length;

            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-amber-400 text-black shadow-lg"
                    : "bg-zinc-100 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <span>
                  {status === "all" ? "All Orders" : getStatusText(status)} ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty Orders State */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center space-y-6 max-w-lg mx-auto bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm"
          >
            <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 w-fit mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black uppercase tracking-tight">No Orders Found</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {filter === "all"
                  ? "You haven't placed any purchases yet."
                  : `No ${filter} orders found in your account.`}
              </p>
            </div>
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest rounded-full transition shadow-xl hover:scale-105"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Orders Cards Grid */
          <div className="space-y-6">
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-50 dark:bg-[#111111] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm hover:border-amber-500/50 transition-all duration-300"
                >
                  {/* Card Top Info */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Order ID:</span>
                        <span className="font-mono font-bold text-amber-500 text-lg">
                          #{order.orderNo || order.id?.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          {new Date(order.orderDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(
                          order.orderStatus || "pending"
                        )}`}
                      >
                        {getStatusIcon(order.orderStatus || "pending")}
                        <span>{getStatusText(order.orderStatus || "pending")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 3).map((item: any, idx: number) => {
                        const itemPrice = item.isOnSale ? item.salePrice ?? item.price : item.price;
                        const specs = [item.color, item.size].filter(Boolean).join(" · ");
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800"
                          >
                            <img
                              src={item.image || "/lookbook/look_book_banner.avif"}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-zinc-900 dark:text-white truncate">
                                {item.name} {specs ? `(${specs})` : ""}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                                Qty: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.quantity}</span> {specs && `· ${specs}`} · Rs. {(itemPrice * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full p-4 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-400 flex items-center gap-2">
                        <Package className="w-4 h-4 text-zinc-500" />
                        <span>No item details attached to this order (Empty / Draft Order)</span>
                      </div>
                    )}

                    {order.items && order.items.length > 3 && (
                      <div className="flex items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-wider text-zinc-400">
                        +{order.items.length - 3} Additional Items
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <div>
                        <span>Payment Method: </span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {getPaymentText(order.paymentMethod || "cod")}
                        </span>
                      </div>
                      <div>
                        <span>Order Total: </span>
                        <span className="font-black text-red-600 dark:text-red-500 text-base">
                          Rs. {order.total?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(order)}
                      className="px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-amber-400 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Receipt & Details</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* ===== ORDER DETAILS MODAL ===== */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-[#111111] text-zinc-900 dark:text-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div className="sticky top-0 bg-white dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800 px-6 py-5 flex items-center justify-between z-10 rounded-t-3xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Order Invoice & Tracking</h2>
                  <p className="text-xs uppercase tracking-widest text-amber-500 font-mono font-bold mt-0.5">
                    #{selectedOrder.orderNo || selectedOrder.id?.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Status & Date Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800">
                  <div
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(
                      selectedOrder.orderStatus || "pending"
                    )}`}
                  >
                    {getStatusIcon(selectedOrder.orderStatus || "pending")}
                    <span>{getStatusText(selectedOrder.orderStatus || "pending")}</span>
                  </div>

                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {new Date(selectedOrder.orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Delivery & Tracking Details Card */}
                {(selectedOrder.trackingNumber || selectedOrder.deliveryCompany || selectedOrder.orderStatus === "delivered") && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-black text-amber-500 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Courier Dispatch & Tracking Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                      <div>
                        <span className="text-zinc-400 uppercase tracking-wider text-[11px] block">Courier Partner</span>
                        <span className="font-bold text-zinc-900 dark:text-white text-sm">
                          {selectedOrder.deliveryCompany || "Sri Lanka Express Courier"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 uppercase tracking-wider text-[11px] block">Waybill / Tracking Number</span>
                        <span className="font-mono font-black text-amber-500 text-sm">
                          {selectedOrder.trackingNumber || "Assigned Upon Dispatch"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items Breakdown List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Order Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, idx: number) => {
                      const itemPrice = item.isOnSale ? item.salePrice ?? item.price : item.price;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4"
                        >
                          <img
                            src={item.image || "/lookbook/look_book_banner.avif"}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-zinc-900 dark:text-white truncate">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                              {item.color && <span>Color: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.color}</span></span>}
                              {item.size && <span>Size: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.size}</span></span>}
                              <span>Qty: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.quantity}</span></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-zinc-900 dark:text-white">
                              Rs. {(itemPrice * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-zinc-900 dark:text-white">Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Islandwide Shipping</span>
                    <span className="font-bold text-zinc-900 dark:text-white">Rs. {selectedOrder.deliveryCharge?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    <span>Grand Total</span>
                    <span className="text-base text-red-600 dark:text-red-500">Rs. {selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex-1">
                    <OrderPDFDownloadButton order={selectedOrder} />
                  </div>
                  <button
                    onClick={closeModal}
                    className="px-6 py-3.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}