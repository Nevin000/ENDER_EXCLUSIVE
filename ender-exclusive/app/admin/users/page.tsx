"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "@/components/admin/AnimatedCounter";
import { getAllOrders, Order } from "@/services/orderService";
import {
  HiOutlineUsers,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronRight,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineShoppingBag,
  HiOutlineEye,
  HiOutlineXMark,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { FaTruck, FaMoneyBillWave, FaBuilding, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
  address: string;
  city: string;
  district: string;
  createdAt?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  lastOrderStatus?: string;
  orders: Order[];
}

const parseSafeDate = (val: any): Date | null => {
  if (!val) return null;
  try {
    if (typeof val === "object" && typeof val.toDate === "function") {
      const d = val.toDate();
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof val === "object" && typeof val.seconds === "number") {
      const d = new Date(val.seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const formatSafeDate = (val: any): string => {
  const d = parseSafeDate(val);
  if (!d) return "N/A";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "buyers" | "top_spenders" | "admins">("all");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);

  // Fetch Firestore users & orders
  useEffect(() => {
    let unsubUsers: (() => void) | null = null;

    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch users real-time
        unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
          setUsers(snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })));
        });

        // Fetch orders
        const fetchedOrders = await getAllOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error loading customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubUsers) unsubUsers();
    };
  }, []);

  // Consolidate customer profile details with purchase history
  const customerList = useMemo<CustomerDetail[]>(() => {
    const map = new Map<string, CustomerDetail>();

    // 1. Process registered users
    users.forEach((u) => {
      const emailKey = u.email?.toLowerCase().trim() || u.id;
      const parsedCreated = parseSafeDate(u.createdAt);
      map.set(emailKey, {
        id: u.id,
        name: u.displayName || u.customerName || u.email?.split("@")[0] || "Registered Customer",
        email: u.email || "",
        phone: u.phone || u.phoneNumber || "",
        role: u.role === "admin" ? "admin" : "customer",
        address: u.address || "",
        city: u.city || "",
        district: u.district || "",
        createdAt: parsedCreated ? parsedCreated.toISOString() : undefined,
        totalOrders: 0,
        totalSpent: 0,
        orders: [],
      });
    });

    // 2. Aggregate orders data for each customer
    orders.forEach((ord) => {
      const emailKey =
        ord.userEmail?.toLowerCase().trim() ||
        ord.shippingAddress?.email?.toLowerCase().trim() ||
        ord.userId;

      let customer = map.get(emailKey);
      if (!customer) {
        customer = {
          id: ord.userId || ord.id || emailKey,
          name:
            ord.customerName ||
            ord.shippingAddress?.fullName ||
            ord.shippingAddress?.firstName ||
            "Customer",
          email: ord.userEmail || ord.shippingAddress?.email || "No Email",
          phone: ord.shippingAddress?.phone || "",
          role: "customer",
          address: ord.shippingAddress?.address || "",
          city: ord.shippingAddress?.city || "",
          district: ord.shippingAddress?.district || "",
          createdAt: ord.orderDate,
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
        };
        map.set(emailKey, customer);
      }

      // Fill in contact info if missing
      if (!customer.phone && ord.shippingAddress?.phone) {
        customer.phone = ord.shippingAddress.phone;
      }
      if (!customer.address && ord.shippingAddress?.address) {
        customer.address = ord.shippingAddress.address;
        customer.city = ord.shippingAddress.city;
        customer.district = ord.shippingAddress.district;
      }

      customer.orders.push(ord);
      customer.totalOrders += 1;
      if (ord.orderStatus !== "cancelled") {
        customer.totalSpent += ord.total || 0;
      }

      // Track last order date
      const ordDate = parseSafeDate(ord.orderDate || ord.createdAt);
      const custLastDate = parseSafeDate(customer.lastOrderDate);

      if (
        ordDate &&
        (!custLastDate || ordDate.getTime() > custLastDate.getTime())
      ) {
        customer.lastOrderDate = ordDate.toISOString();
        customer.lastOrderStatus = ord.orderStatus;
      }
    });

    return Array.from(map.values());
  }, [users, orders]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    let result = customerList.filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });

    if (activeTab === "buyers") {
      result = result.filter((c) => c.totalOrders > 0);
    } else if (activeTab === "admins") {
      result = result.filter((c) => c.role === "admin");
    } else if (activeTab === "top_spenders") {
      result = [...result].sort((a, b) => b.totalSpent - a.totalSpent);
    }

    return result;
  }, [customerList, search, activeTab]);

  // Computed summary metrics
  const totalCustomers = customerList.length;
  const buyerCount = customerList.filter((c) => c.totalOrders > 0).length;
  const adminCount = customerList.filter((c) => c.role === "admin").length;
  const totalCustomerRevenue = customerList.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = buyerCount > 0 ? Math.round(totalCustomerRevenue / buyerCount) : 0;

  // Export PDF function (matching Products page format with jsPDF & autoTable)
  const exportPDF = () => {
    if (filteredCustomers.length === 0) {
      alert("No customer records available to export as PDF.");
      return;
    }

    try {
      setIsExportingPDF(true);

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Title Header Background Banner
      doc.setFillColor(17, 17, 17);
      doc.rect(0, 0, 297, 36, "F");

      // Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(245, 158, 11);
      doc.text("ENDER EXCLUSIVE", 14, 15);

      // Report Subtitle
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("OFFICIAL CUSTOMER DIRECTORY AUDIT REPORT", 14, 23);

      // Report Metadata
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Customers: ${filteredCustomers.length}`, 220, 30);

      // Executive Summary Metrics Table
      const buyerCount = filteredCustomers.filter((c) => c.totalOrders > 0).length;
      const totalCustomerRevenue = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

      autoTable(doc, {
        startY: 42,
        head: [["Customer Directory Metric", "Value", "Notes"]],
        body: [
          ["Total Customers Exported", `${filteredCustomers.length} Customers`, "Active directory list"],
          ["Active Purchasing Buyers", `${buyerCount} Buyers`, `${Math.round((buyerCount / (filteredCustomers.length || 1)) * 100)}% customer conversion`],
          ["Total Customer Revenue", `Rs. ${totalCustomerRevenue.toLocaleString()}`, "Combined order spend"],
        ],
        theme: "striped",
        headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0], fontStyle: "bold" },
        styles: { font: "helvetica", fontSize: 8.5 },
      });

      // Itemized Customer Directory Table
      const currentY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(17, 17, 17);
      doc.text("ITEMIZED CUSTOMER DIRECTORY", 14, currentY);

      const tableRows = filteredCustomers.map((c, idx) => [
        idx + 1,
        c.name,
        c.email,
        c.phone || "N/A",
        c.city ? `${c.city}${c.district ? `, ${c.district}` : ""}` : "N/A",
        c.role === "admin" ? "Admin" : "Customer",
        `${c.totalOrders} ${c.totalOrders === 1 ? "Order" : "Orders"}`,
        `Rs. ${c.totalSpent.toLocaleString()}`,
        formatSafeDate(c.lastOrderDate),
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["#", "Customer Name", "Email Address", "Phone", "Location / Address", "Role", "Orders", "Total Spent", "Last Order"]],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { font: "helvetica", fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 42 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30 },
          4: { cellWidth: 45 },
          5: { cellWidth: 18 },
          6: { cellWidth: 20 },
          7: { cellWidth: 28 },
          8: { cellWidth: 26 },
        },
      });

      doc.save(`ENDER_EXCLUSIVE_Customers_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Failed to generate Customer PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50";
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

  const getStatusText = (status?: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "delivered":
        return "Hand Over Delivery";
      case "cancelled":
        return "Cancelled";
      default:
        return status || "N/A";
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto space-y-10 pb-36 font-sans">
        <div className="relative bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl border border-white/20 dark:border-[#2A2A2A]/60 rounded-3xl p-16 text-center shadow-2xl shadow-black/5">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-base font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
            Loading Customer Profiles & Directory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-10 pb-36 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      {/* ===== HEADER BANNER ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0D0D0D] border border-white/30 dark:border-[#2A2A2A]/50 shadow-2xl shadow-black/5 p-8 md:p-10">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">
              <span>Admin Portal</span>
              <HiOutlineChevronRight className="w-4 h-4 text-zinc-400" />
              <span className="text-amber-500 dark:text-amber-400 font-extrabold">Customers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              Customer <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Directory</span>
            </h1>
            <p className="text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              Complete details for all customer accounts, purchasing history, shipping addresses, and lifetime metrics.
            </p>
          </div>

          <button
            onClick={exportPDF}
            disabled={isExportingPDF}
            className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-wider text-xs sm:text-sm px-6 py-4 rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 shadow-xl shadow-black/10 cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <FaFilePdf className="w-5 h-5 text-rose-500" />
            <span>{isExportingPDF ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* ===== KPI METRICS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Customers */}
        <motion.div
          whileHover={{ y: -6 }}
          className="relative group bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-zinc-400">Total Customers</span>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg">
              <HiOutlineUsers className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white font-mono mt-3">
            <AnimatedCounter value={totalCustomers} />
          </div>
        </motion.div>

        {/* Active Buyers */}
        <motion.div
          whileHover={{ y: -6 }}
          className="relative group bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-zinc-400">Active Buyers</span>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
              <HiOutlineShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl lg:text-5xl font-black text-emerald-500 dark:text-emerald-400 font-mono mt-3">
            <AnimatedCounter value={buyerCount} />
          </div>
        </motion.div>
      </div>

      {/* ===== SEARCH & FILTER RIBBON ===== */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone number, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl text-base font-bold text-zinc-900 dark:text-white outline-none transition-all duration-300 shadow-inner shadow-black/5"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: "all", label: "All Customers" },
            { id: "buyers", label: "Active Buyers" },
            { id: "top_spenders", label: "Top Spenders" },
            { id: "admins", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CUSTOMERS TABLE ===== */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-zinc-50/80 to-zinc-100/80 dark:from-[#1A1A1A]/80 dark:to-[#0D0D0D]/80 border-b border-zinc-200/60 dark:border-zinc-800/60 text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-5">Customer Profile</th>
                <th className="px-6 py-5">Contact & Location</th>
                <th className="px-6 py-5">Orders</th>
                <th className="px-6 py-5">Total Spent</th>
                <th className="px-6 py-5">Last Order</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/60 dark:divide-zinc-800/40 text-base font-normal">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-zinc-50/60 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Profile */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-black font-extrabold text-lg flex items-center justify-center shadow-md">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                            {cust.name}
                            {cust.role === "admin" && (
                              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-sm font-normal text-zinc-400 font-mono mt-0.5">{cust.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td className="px-6 py-5">
                      <div className="space-y-0.5 text-sm font-normal text-zinc-600 dark:text-zinc-300">
                        {cust.phone ? (
                          <div className="flex items-center gap-2">
                            <HiOutlinePhone className="w-4 h-4 text-emerald-500" />
                            <span>{cust.phone}</span>
                          </div>
                        ) : null}
                        {cust.city ? (
                          <div className="flex items-center gap-2 text-zinc-400">
                            <HiOutlineMapPin className="w-4 h-4 text-blue-500" />
                            <span>
                              {cust.city}
                              {cust.district ? `, ${cust.district}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 font-mono">No Address Saved</span>
                        )}
                      </div>
                    </td>

                    {/* Orders Count */}
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200/60 dark:border-zinc-700/50">
                        {cust.totalOrders} {cust.totalOrders === 1 ? "Order" : "Orders"}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="px-6 py-5">
                      <span className="font-mono font-medium text-base sm:text-lg text-amber-600 dark:text-amber-400">
                        Rs. {cust.totalSpent.toLocaleString()}
                      </span>
                    </td>

                    {/* Last Order */}
                    <td className="px-6 py-5">
                      {cust.lastOrderDate ? (
                        <div>
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {formatSafeDate(cust.lastOrderDate)}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${getStatusBadgeStyle(
                              cust.lastOrderStatus
                            )}`}
                          >
                            {getStatusText(cust.lastOrderStatus)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 font-mono">No Orders Yet</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className="inline-flex items-center gap-2 p-2.5 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-2xl hover:bg-amber-500 hover:text-black transition cursor-pointer border border-white/20 dark:border-zinc-700/50 shadow-sm"
                        title="View Customer Profile"
                      >
                        <HiOutlineEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-zinc-100/80 dark:bg-zinc-800/80 rounded-3xl flex items-center justify-center border border-white/20 dark:border-zinc-700/50 shadow-sm">
                        <HiOutlineUsers className="w-8 h-8 text-zinc-400" />
                      </div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">No Customers Found</p>
                      <p className="text-sm text-zinc-400">Try matching customer names, emails, or phone numbers</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FULL CUSTOMER PROFILE MODAL ===== */}
      <AnimatePresence>
        {selectedCustomer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-[#141414] text-zinc-900 dark:text-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800 font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-[#141414] border-b border-zinc-200 dark:border-zinc-800 px-6 sm:px-8 py-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-black font-extrabold text-2xl flex items-center justify-center shadow-lg">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      {selectedCustomer.name}
                      {selectedCustomer.role === "admin" && (
                        <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
                          Administrator
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer"
                >
                  <HiOutlineXMark className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl">
                    <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block">Lifetime Spend</span>
                    <span className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                      Rs. {selectedCustomer.totalSpent.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl">
                    <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block">Total Orders</span>
                    <span className="text-2xl font-mono font-bold text-zinc-900 dark:text-white mt-1 block">
                      {selectedCustomer.totalOrders} {selectedCustomer.totalOrders === 1 ? "Order" : "Orders"}
                    </span>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl">
                    <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block">Avg Order Value</span>
                    <span className="text-2xl font-mono font-bold text-emerald-500 dark:text-emerald-400 mt-1 block">
                      Rs. {(selectedCustomer.totalOrders > 0 ? Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders) : 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Contact & Address Details */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs sm:text-sm uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <HiOutlineMapPin className="text-blue-500 text-base" />
                    Customer Contact & Shipping Address
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm font-normal">
                    <div>
                      <span className="text-xs text-zinc-400 uppercase font-medium block">Phone Number</span>
                      <span className="font-semibold text-zinc-900 dark:text-white font-mono">
                        {selectedCustomer.phone || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 uppercase font-medium block">Email Address</span>
                      <span className="font-semibold text-zinc-900 dark:text-white font-mono">
                        {selectedCustomer.email}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs text-zinc-400 uppercase font-medium block">Shipping Address</span>
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {selectedCustomer.address
                          ? `${selectedCustomer.address}, ${selectedCustomer.city}${selectedCustomer.district ? `, ${selectedCustomer.district}` : ""}`
                          : "No shipping address saved"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h3 className="text-xs sm:text-sm uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                    <HiOutlineShoppingBag className="text-amber-500 text-base" />
                    Purchase History ({selectedCustomer.orders.length})
                  </h3>

                  {selectedCustomer.orders.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {selectedCustomer.orders.map((ord, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl text-sm"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                #{ord.orderNo || ord.id?.slice(0, 8).toUpperCase()}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(
                                  ord.orderStatus
                                )}`}
                              >
                                {getStatusText(ord.orderStatus)}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-normal mt-1">
                              {formatSafeDate(ord.orderDate || ord.createdAt)} · {ord.items?.length || 0} items
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-base text-zinc-900 dark:text-white block">
                              Rs. {ord.total?.toLocaleString()}
                            </span>
                            {ord.trackingNumber && (
                              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold block">
                                Track: #{ord.trackingNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                      <p className="text-sm font-semibold text-zinc-400">No orders placed by this customer yet.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="w-full py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold uppercase tracking-wider text-xs rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
