"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Product } from "@/types/product";
import { Order } from "@/types/order";
import { FighterImage } from "@/types/fighter";
import { LookBookCollection } from "@/types/lookbook";

import {
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlinePlus,
  HiOutlineArrowPath,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineTag,
  HiOutlineClipboardDocumentCheck,
  HiOutlineTicket,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChevronRight,
  HiOutlineInbox,
} from "react-icons/hi2";

export default function AdminDashboardPage() {
  const { adminUser, adminLoading } = useAdminAuth();

  // 100% Real Firestore Snapshot State
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [lookbooks, setLookbooks] = useState<LookBookCollection[]>([]);
  const [fighters, setFighters] = useState<FighterImage[]>([]);

  // UI Interactive States
  const [dateRange, setDateRange] = useState("All Time");
  const [chartTab, setChartTab] = useState<"revenue" | "orders" | "categories" | "users">("revenue");
  const [tableTab, setTableTab] = useState<"orders" | "customers" | "lowStock" | "products" | "lookbook" | "fighters">("orders");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // ⚡ REAL-TIME FIRESTORE SUBSCRIPTIONS (onSnapshot)
  useEffect(() => {
    setLoading(true);

    // 1. Subscribe to Live Products
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));
      setProducts(list);
    }, (err) => console.error("Error in products realtime listener:", err));

    // 2. Subscribe to Live Orders
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));
      setOrders(list);
    }, (err) => console.error("Error in orders realtime listener:", err));

    // 3. Subscribe to Live Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setUsers(list);
    }, (err) => console.error("Error in users realtime listener:", err));

    // 4. Subscribe to Live Lookbook Collections
    const unsubLookbooks = onSnapshot(collection(db, "lookbook_collections"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<LookBookCollection, "id">),
      }));
      setLookbooks(list);
    }, (err) => console.error("Error in lookbook realtime listener:", err));

    // 5. Subscribe to Live Fighters Showcase
    const unsubFighters = onSnapshot(collection(db, "fighters"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FighterImage, "id">),
      }));
      setFighters(list);
    }, (err) => console.error("Error in fighters realtime listener:", err));

    setLoading(false);

    // Clean up subscriptions on unmount
    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
      unsubLookbooks();
      unsubFighters();
    };
  }, []);

  // 🧮 COMPUTED REAL DATABASE METRICS (useMemo)
  const metrics = useMemo(() => {
    const totalProdCount = products.length;
    const activeProdCount = products.filter((p) => p.status === "active").length;
    const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;
    const lowStockCount = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
    const categoriesCount = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).length;

    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "pending_payment").length;
    const processingOrdersCount = orders.filter((o) => o.orderStatus === "processing").length;
    const completedOrdersCount = orders.filter((o) => o.orderStatus === "delivered").length;
    const cancelledOrdersCount = orders.filter((o) => o.orderStatus === "cancelled").length;

    // Date filtering calculations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const parseTimestamp = (val: any): number => {
      if (!val) return 0;
      if (val.seconds) return val.seconds * 1000;
      if (typeof val === "string") return new Date(val).getTime();
      return 0;
    };

    const todayOrdersCount = orders.filter((o) => parseTimestamp(o.createdAt || o.orderDate) >= startOfToday).length;
    const weekOrdersCount = orders.filter((o) => parseTimestamp(o.createdAt || o.orderDate) >= startOfWeek).length;
    const monthOrdersCount = orders.filter((o) => parseTimestamp(o.createdAt || o.orderDate) >= startOfMonth).length;

    // Total Revenue (Non-cancelled orders)
    const totalRevenueSum = orders
      .filter((o) => o.orderStatus !== "cancelled")
      .reduce((sum, o) => sum + (o.total || o.subtotal || 0), 0);

    const customersCount = users.filter((u) => u.role !== "admin").length;
    const adminsCount = users.filter((u) => u.role === "admin").length;

    const publishedFightersCount = fighters.filter((f) => f.status === "published").length;
    const publishedLookbooksCount = lookbooks.filter((l) => l.status === "published").length;

    return {
      totalProdCount,
      activeProdCount,
      outOfStockCount,
      lowStockCount,
      categoriesCount,
      totalOrdersCount,
      pendingOrdersCount,
      processingOrdersCount,
      completedOrdersCount,
      cancelledOrdersCount,
      todayOrdersCount,
      weekOrdersCount,
      monthOrdersCount,
      totalRevenueSum,
      customersCount,
      adminsCount,
      publishedFightersCount,
      publishedLookbooksCount,
    };
  }, [products, orders, users, lookbooks, fighters]);

  // 📈 REALTIME MONTHLY CHART DATA (Jan - Dec 2026)
  const monthlyRevenueChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthStats = months.map((m) => ({ month: m, revenue: 0, orders: 0 }));

    orders.forEach((o) => {
      if (o.orderStatus === "cancelled") return;
      const dateVal = o.createdAt || o.orderDate;
      if (!dateVal) return;
      const date = (dateVal as any)?.seconds ? new Date((dateVal as any).seconds * 1000) : new Date(dateVal);
      const mIdx = date.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        monthStats[mIdx].revenue += o.total || o.subtotal || 0;
        monthStats[mIdx].orders += 1;
      }
    });

    const maxRev = Math.max(...monthStats.map((m) => m.revenue), 1);
    return monthStats.map((m, idx) => ({
      ...m,
      heightPct: Math.max(Math.round((m.revenue / maxRev) * 100), 5),
      x: 40 + idx * 48,
      y: 160 - Math.round((m.revenue / maxRev) * 130),
    }));
  }, [orders]);

  // 🏷️ REALTIME CATEGORY DISTRIBUTION
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category ? p.category.toLowerCase() : "uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const total = products.length || 1;
    const colors = ["bg-amber-500", "bg-black dark:bg-white", "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-pink-500"];

    return Object.entries(counts).map(([name, count], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[i % colors.length],
    }));
  }, [products]);

  // 🏆 REALTIME BEST SELLING PRODUCTS (Aggregated from Orders)
  const bestSellingProducts = useMemo(() => {
    const itemMap: Record<string, { name: string; sales: number; revenue: number; image?: string }> = {};

    orders.forEach((order) => {
      if (order.orderStatus === "cancelled" || !order.items) return;
      order.items.forEach((item) => {
        const id = item.productId || item.name;
        if (!itemMap[id]) {
          itemMap[id] = {
            name: item.name,
            sales: 0,
            revenue: 0,
            image: (item as any).imageUrl || item.image,
          };
        }
        itemMap[id].sales += item.quantity || 1;
        itemMap[id].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);
  }, [orders]);

  if (adminLoading || !adminUser) return null;

  const displayName = adminUser.displayName || adminUser.email?.split("@")[0] || "Admin";

  // 6 Primary KPI Metric Cards
  const kpiCards = [
    {
      title: "Total Products",
      value: `${metrics.totalProdCount}`,
      subtext: `${metrics.activeProdCount} Active • ${metrics.outOfStockCount} Out of Stock`,
      icon: HiOutlineCube,
      bg: "bg-blue-50/80 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      badge: `${metrics.categoriesCount} Categories`,
      badgeColor: "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300",
    },
    {
      title: "Total Orders",
      value: `${metrics.totalOrdersCount}`,
      subtext: `${metrics.completedOrdersCount} Completed • ${metrics.cancelledOrdersCount} Cancelled`,
      icon: HiOutlineShoppingBag,
      bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badge: `${metrics.pendingOrdersCount} Pending`,
      badgeColor: "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300",
    },
    {
      title: "Registered Customers",
      value: `${metrics.customersCount}`,
      subtext: `${metrics.adminsCount} Admin Administrators`,
      icon: HiOutlineUsers,
      bg: "bg-purple-50/80 dark:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      badge: `Live Sync`,
      badgeColor: "bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${metrics.totalRevenueSum.toLocaleString()}`,
      subtext: `From ${metrics.totalOrdersCount - metrics.cancelledOrdersCount} valid orders`,
      icon: HiOutlineBanknotes,
      bg: "bg-amber-50/80 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      badge: `Live PKR`,
      badgeColor: "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300",
    },
    {
      title: "Low Stock Alert",
      value: `${metrics.lowStockCount} Items`,
      subtext: `Products with stock <= 5 units`,
      icon: HiOutlineExclamationTriangle,
      bg: "bg-red-50/80 dark:bg-red-950/30",
      iconColor: "text-red-600 dark:text-red-400",
      badge: metrics.lowStockCount > 0 ? "Action Needed" : "Healthy Stock",
      badgeColor: metrics.lowStockCount > 0 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Pending Orders",
      value: `${metrics.pendingOrdersCount} Orders`,
      subtext: `${metrics.processingOrdersCount} Processing in warehouse`,
      icon: HiOutlineClock,
      bg: "bg-orange-50/80 dark:bg-orange-950/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      badge: `${metrics.todayOrdersCount} Placed Today`,
      badgeColor: "bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300",
    },
  ];

  // Quick Action Links
  const quickActions = [
    { title: "Add New Product", description: "Create & publish product listing", href: "/admin/products/add", icon: HiOutlinePlus },
    { title: "Featured Look Book", description: "Curate editorial lookbook collections", href: "/admin/lookbook", icon: HiOutlineSparkles },
    { title: "Featured Fighters", description: "Manage brand ambassador gallery", href: "/admin/fighters", icon: HiOutlineUserGroup },
    { title: "Manage Orders", description: "Fulfill pending customer orders", href: "/admin/orders", icon: HiOutlineShoppingBag },
    { title: "View Customers", description: "Manage registered user accounts", href: "/admin/users", icon: HiOutlineUsers },
    { title: "Products Catalog", description: "Monitor inventory stock & reorders", href: "/admin/products", icon: HiOutlineClipboardDocumentCheck },
  ];

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20">
      {/* ===== 1. REALTIME DASHBOARD HEADER ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0D0D0D] border border-white/30 dark:border-[#2A2A2A]/50 shadow-2xl shadow-black/5 p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-[0.15em] mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE FIRESTORE REALTIME SYNC</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              Ender Exclusive <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              Welcome back, <span className="font-extrabold text-zinc-900 dark:text-white">{displayName}</span>. Live store inventory, customer orders, and revenue metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin/products/add"
              className="flex items-center gap-2.5 px-7 py-4 bg-gradient-to-r from-zinc-900 to-black dark:from-white dark:to-zinc-200 text-white dark:text-black rounded-2xl text-sm font-extrabold uppercase tracking-wider hover:opacity-90 transition shadow-xl cursor-pointer"
            >
              <HiOutlinePlus className="w-5 h-5 stroke-[2.5]" />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== 2. 6 CORE LIVE FIRESTORE KPI STAT CARDS ===== */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-[#2A2A2A] rounded-3xl p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {kpiCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.iconColor} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6" />
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {card.title}
                </p>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">
                  {card.value}
                </h2>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-1">
                  {card.subtext}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ===== 3. LIVE FIRESTORE ANALYTICS & CHARTS SECTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 (2-Cols wide): Realtime Monthly Revenue Curve & Orders Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                <HiOutlineChartBar className="w-5 h-5 text-amber-500" />
                Live Revenue & Orders Monthly Analytics
              </h2>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                Calculated directly from live order timestamps in Firestore
              </p>
            </div>

            {/* Chart Mode Toggle */}
            <div className="flex items-center p-1 bg-zinc-100 dark:bg-[#161616] border border-zinc-200 dark:border-[#2A2A2A] rounded-2xl">
              <button
                onClick={() => setChartTab("revenue")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${chartTab === "revenue"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
              >
                Revenue Path
              </button>
              <button
                onClick={() => setChartTab("orders")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${chartTab === "orders"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
              >
                Orders Bar
              </button>
            </div>
          </div>

          {/* Dynamic SVG / Bar Chart Container */}
          <div className="relative pt-4 pb-2">
            {chartTab === "revenue" ? (
              <div className="relative h-64 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180">
                  <defs>
                    <linearGradient id="liveRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#E5E7EB" strokeDasharray="4 4" opacity="0.3" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#E5E7EB" strokeDasharray="4 4" opacity="0.3" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#E5E7EB" strokeDasharray="4 4" opacity="0.3" />

                  {/* Dynamic Interactive SVG path */}
                  <path
                    d={`M 40 ${monthlyRevenueChartData[0]?.y || 160} ` + monthlyRevenueChartData.map((d) => `L ${d.x} ${d.y}`).join(" ") + ` L 560 170 L 40 170 Z`}
                    fill="url(#liveRevenueGrad)"
                  />

                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                    d={`M 40 ${monthlyRevenueChartData[0]?.y || 160} ` + monthlyRevenueChartData.map((d) => `L ${d.x} ${d.y}`).join(" ")}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {monthlyRevenueChartData.map((pt, i) => (
                    <circle
                      key={pt.month}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint === i ? 7 : 4}
                      className="fill-amber-500 stroke-white dark:stroke-black transition-all cursor-pointer"
                      strokeWidth="2.5"
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </svg>

                {/* Hover Tooltip */}
                {hoveredPoint !== null && (
                  <div
                    className="absolute bg-zinc-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl border border-zinc-700 pointer-events-none transition-all -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `${(monthlyRevenueChartData[hoveredPoint].x / 600) * 100}%`,
                      top: `${(monthlyRevenueChartData[hoveredPoint].y / 180) * 100}%`,
                    }}
                  >
                    {monthlyRevenueChartData[hoveredPoint].month}: Rs. {monthlyRevenueChartData[hoveredPoint].revenue.toLocaleString()} ({monthlyRevenueChartData[hoveredPoint].orders} orders)
                  </div>
                )}

                {/* X-Axis Month Labels */}
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500 pt-4 px-2">
                  {monthlyRevenueChartData.map((d) => (
                    <span key={d.month}>{d.month}</span>
                  ))}
                </div>
              </div>
            ) : (
              // Orders Bar Chart
              <div className="h-64 flex items-end justify-between gap-3 px-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                {monthlyRevenueChartData.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full max-w-[36px] bg-zinc-100 dark:bg-[#1A1A1A] rounded-2xl h-full flex items-end p-1 overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.heightPct}%` }}
                        transition={{ duration: 0.6 }}
                        className="w-full rounded-xl bg-zinc-900 dark:bg-amber-500 group-hover:bg-amber-400 transition-colors"
                      />
                    </div>
                    <span className="text-[11px] font-bold mt-2 text-zinc-500 group-hover:text-amber-500">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Total Live Firestore Orders Analyzed: {orders.length} Orders</span>
            <span className="text-emerald-600 font-bold">100% Realtime Firestore Subscription</span>
          </div>
        </div>

        {/* Column 2 (1-Col): Realtime Category Distribution & Best Sellers */}
        <div className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase mb-1">
              Category Distribution
            </h2>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-6">
              Product catalog breakdown by category
            </p>

            {categoryDistribution.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 space-y-2">
                <HiOutlineInbox className="w-8 h-8 mx-auto text-zinc-300" />
                <p className="text-xs font-bold">No product categories found in database.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryDistribution.map((cat) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-800 dark:text-zinc-200">{cat.name}</span>
                      <span className="text-zinc-500">{cat.percentage}% ({cat.count} Items)</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-[#1A1A1A] h-2.5 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${cat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Selling Products List */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              Best Selling Ordered Products
            </h3>

            {bestSellingProducts.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No completed order items recorded yet.</p>
            ) : (
              bestSellingProducts.map((prod) => (
                <div key={prod.name} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px]">
                          EE
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{prod.name}</h4>
                      <span className="text-[11px] text-zinc-400 font-medium">{prod.sales} Sold</span>
                    </div>
                  </div>
                  <span className="font-black text-zinc-900 dark:text-white">Rs. {prod.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===== 4. MULTI-TAB LIVE DATA CENTER TABLE ===== */}
      <div className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-8 shadow-sm space-y-6">
        {/* Tab Selection Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-2 overflow-x-auto p-1 bg-zinc-100 dark:bg-[#161616] rounded-2xl border border-zinc-200 dark:border-[#2A2A2A]">
            {[
              { id: "orders", label: `Recent Orders (${orders.length})` },
              { id: "customers", label: `Customers (${users.length})` },
              { id: "lowStock", label: `Low Stock Alert (${metrics.lowStockCount})` },
              { id: "products", label: `Products Catalog (${products.length})` },
              { id: "lookbook", label: `Look Book (${lookbooks.length})` },
              { id: "fighters", label: `Fighters Showcase (${fighters.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTableTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${tableTab === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href={
              tableTab === "orders" ? "/admin/orders" :
                tableTab === "customers" ? "/admin/users" :
                  tableTab === "lowStock" ? "/admin/products" :
                    tableTab === "lookbook" ? "/admin/lookbook" :
                      tableTab === "fighters" ? "/admin/fighters" : "/admin/products"
            }
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline uppercase tracking-wider"
          >
            <span>View Full Section</span>
            <HiOutlineChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Live Tables */}
        <div className="overflow-x-auto">
          {tableTab === "orders" && (
            orders.length === 0 ? (
              <div className="py-16 text-center space-y-3 text-zinc-400">
                <HiOutlineInbox className="w-10 h-10 mx-auto text-zinc-300" />
                <p className="text-sm font-bold">No customer orders placed in Firestore database yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3">Order No / ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm font-semibold">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-[#161616] transition-colors">
                      <td className="py-4 font-mono font-bold text-zinc-900 dark:text-white">{ord.orderNo || ord.id?.slice(0, 8)}</td>
                      <td className="py-4">
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white">{ord.customerName || ord.shippingAddress?.fullName || "Guest Customer"}</div>
                          <div className="text-xs text-zinc-400 font-medium">{ord.userEmail || ord.shippingAddress?.email}</div>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-zinc-500">{ord.items?.length || 1} Items</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${ord.orderStatus === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          ord.orderStatus === "processing" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            ord.orderStatus === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-zinc-100 text-zinc-700 border-zinc-200"
                          }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right font-black text-zinc-900 dark:text-white">Rs. {(ord.total || ord.subtotal || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {tableTab === "customers" && (
            users.length === 0 ? (
              <div className="py-16 text-center space-y-3 text-zinc-400">
                <HiOutlineInbox className="w-10 h-10 mx-auto text-zinc-300" />
                <p className="text-sm font-bold">No registered user accounts found in Firestore database.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3">User ID</th>
                    <th className="pb-3">Customer Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm font-semibold">
                  {users.slice(0, 5).map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-[#161616] transition-colors">
                      <td className="py-4 font-mono font-bold text-zinc-900 dark:text-white">{u.id?.slice(0, 8)}</td>
                      <td className="py-4 font-bold text-zinc-900 dark:text-white">{u.displayName || u.name || "Customer"}</td>
                      <td className="py-4 text-xs text-zinc-500">{u.email}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"
                          }`}>
                          {u.role || "customer"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {tableTab === "lowStock" && (
            products.filter((p) => (p.stock || 0) <= 5).length === 0 ? (
              <div className="py-16 text-center space-y-3 text-zinc-400">
                <HiOutlineCheckCircle className="w-10 h-10 mx-auto text-emerald-500" />
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">All products have healthy inventory stock levels (no products with 5 or fewer units).</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Stock Remaining</th>
                    <th className="pb-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm font-semibold">
                  {products.filter((p) => (p.stock || 0) <= 5).map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-[#161616] transition-colors">
                      <td className="py-4 font-bold text-zinc-900 dark:text-white">{p.name}</td>
                      <td className="py-4 text-xs text-zinc-500">{p.category}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">
                          {p.stock} Units Remaining
                        </span>
                      </td>
                      <td className="py-4 text-right font-black text-zinc-900 dark:text-white">Rs. {p.price?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {tableTab === "products" && (
            products.length === 0 ? (
              <div className="py-16 text-center space-y-3 text-zinc-400">
                <HiOutlineInbox className="w-10 h-10 mx-auto text-zinc-300" />
                <p className="text-sm font-bold">No products created in Firestore database yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm font-semibold">
                  {products.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-[#161616] transition-colors">
                      <td className="py-4 font-bold text-zinc-900 dark:text-white">{p.name}</td>
                      <td className="py-4 text-xs text-zinc-500">{p.category}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${p.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-700"
                          }`}>
                          {p.status || "active"}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-bold text-zinc-700 dark:text-zinc-300">{p.stock} Units</td>
                      <td className="py-4 text-right font-black text-zinc-900 dark:text-white">Rs. {p.price?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {tableTab === "lookbook" && (
            lookbooks.length === 0 ? (
              <div className="py-16 text-center space-y-3 text-zinc-400">
                <HiOutlineInbox className="w-10 h-10 mx-auto text-zinc-300" />
                <p className="text-sm font-bold">No Lookbook collections found in Firestore database.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3">Collection Title</th>
                    <th className="pb-3">Gender / Target</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm font-semibold">
                  {lookbooks.map((col) => (
                    <tr key={col.id} className="hover:bg-zinc-50 dark:hover:bg-[#161616] transition-colors">
                      <td className="py-4 font-bold text-zinc-900 dark:text-white">{col.title}</td>
                      <td className="py-4 text-xs text-zinc-500 uppercase font-bold">{col.gender}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${col.status === "published" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"
                          }`}>
                          {col.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {tableTab === "fighters" && (
            fighters.length === 0 ? (
              <div className="py-16 text-center space-y-3 text-zinc-400">
                <HiOutlineInbox className="w-10 h-10 mx-auto text-zinc-300" />
                <p className="text-sm font-bold">No Fighters gallery images uploaded to Firestore database yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
                {fighters.slice(0, 6).map((img, i) => (
                  <div key={img.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 dark:border-zinc-800">
                    <img src={img.imageUrl} alt="Fighter" className="object-cover w-full h-full" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-amber-400 font-bold text-[10px] uppercase rounded-full backdrop-blur-md">
                      #{img.displayOrder || i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ===== 5. 6 OPERATIONAL QUICK ACTIONS GRID ===== */}
      <div className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase mb-1">
            Quick Operational Actions
          </h2>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Instant operations & catalog shortcuts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((act) => (
            <Link
              key={act.title}
              href={act.href}
              className="group flex items-center justify-between p-5 rounded-2xl border border-zinc-200/80 dark:border-[#2A2A2A] bg-zinc-50/50 dark:bg-[#161616] hover:border-black dark:hover:border-white transition-all duration-300 shadow-xs hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center transition-transform group-hover:scale-105 shadow-md">
                  <act.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{act.description}</p>
                </div>
              </div>

              <HiOutlineChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}