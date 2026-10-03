"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  HiOutlineChartBar,
  HiOutlineBanknotes,
  HiOutlineShoppingBag,
  HiOutlineCheckCircle,
  HiOutlineArrowTrendingUp,
  HiOutlineDocumentArrowDown,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineTrophy,
  HiOutlineCreditCard,
  HiOutlineTruck,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineCalendar,
  HiOutlineFunnel,
} from "react-icons/hi2";

import { FaSpinner, FaFire } from "react-icons/fa";

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNo?: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: any;
  userEmail?: string;
  customerName?: string;
  items?: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [graphType, setGraphType] = useState<"linear" | "bar">("linear");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(new Date().getMonth());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Subscribe to Live Orders & Products Collections in Firestore
  useEffect(() => {
    setLoading(true);

    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(
      qOrders,
      (snapshot) => {
        const orderList: Order[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          orderList.push({
            id: doc.id,
            orderNo: data.orderNo,
            total: Number(data.total) || 0,
            orderStatus: data.orderStatus || "pending",
            paymentMethod: data.paymentMethod || "cod",
            createdAt: data.createdAt,
            userEmail: data.userEmail || "customer@example.com",
            customerName: data.customerName || data.shippingAddress?.fullName || "Customer",
            items: data.items || [],
          });
        });
        setOrders(orderList);
        setLoading(false);
      },
      (error) => {
        console.error("Orders subscription error:", error);
        setLoading(false);
      }
    );

    const qProducts = collection(db, "products");
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const prodList: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        prodList.push({
          id: doc.id,
          name: data.name || "Untitled Product",
          price: Number(data.price) || 0,
          category: data.category || "Uncategorized",
          stock: Number(data.stock) || 0,
        });
      });
      setProducts(prodList);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  // Safe Helper to Extract Order Date, Month, Year
  const getOrderDateInfo = (createdAt: any) => {
    let d: Date | null = null;
    if (createdAt?.toDate) {
      d = createdAt.toDate();
    } else if (createdAt?.seconds) {
      d = new Date(createdAt.seconds * 1000);
    } else if (typeof createdAt === "string") {
      d = new Date(createdAt);
    }

    if (!d || isNaN(d.getTime())) {
      d = new Date();
    }

    return {
      date: d,
      monthIdx: d.getMonth(),
      yearStr: d.getFullYear().toString(),
    };
  };

  // Filter Orders based on Selected Year
  const filteredOrders = useMemo(() => {
    if (selectedYear === "all") return orders;
    return orders.filter((o) => {
      const { yearStr } = getOrderDateInfo(o.createdAt);
      return yearStr === selectedYear;
    });
  }, [orders, selectedYear]);

  // Financial KPI Metrics for Selected Year
  const deliveredOrders = useMemo(
    () => filteredOrders.filter((o) => o.orderStatus === "delivered"),
    [filteredOrders]
  );

  const validOrders = useMemo(
    () => filteredOrders.filter((o) => o.orderStatus !== "cancelled"),
    [filteredOrders]
  );

  const pendingOrders = useMemo(
    () => filteredOrders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "pending_payment"),
    [filteredOrders]
  );

  const processingOrders = useMemo(
    () => filteredOrders.filter((o) => o.orderStatus === "processing"),
    [filteredOrders]
  );

  const shippedOrders = useMemo(
    () => filteredOrders.filter((o) => o.orderStatus === "shipped"),
    [filteredOrders]
  );

  const cancelledOrders = useMemo(
    () => filteredOrders.filter((o) => o.orderStatus === "cancelled"),
    [filteredOrders]
  );

  // Delivered Net Income (Money from completed delivered orders)
  const deliveredIncome = useMemo(
    () => deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    [deliveredOrders]
  );

  // Gross Placed Revenue
  const grossPlacedRevenue = useMemo(
    () => validOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    [validOrders]
  );

  // Total Delivered Product Units Count
  const deliveredUnitsCount = useMemo(() => {
    let count = 0;
    deliveredOrders.forEach((o) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          count += item.quantity || 1;
        });
      }
    });
    return count;
  }, [deliveredOrders]);

  // Average Spend per Delivered Order
  const avgDeliveredOrderValue = useMemo(
    () => (deliveredOrders.length > 0 ? deliveredIncome / deliveredOrders.length : 0),
    [deliveredOrders, deliveredIncome]
  );

  // Delivery Fulfillment Rate
  const deliveryCompletionRate = useMemo(
    () => (filteredOrders.length > 0 ? Math.round((deliveredOrders.length / filteredOrders.length) * 100) : 0),
    [filteredOrders, deliveredOrders]
  );

  // 2. High-Selling Products Leaderboard
  const highSellingProducts = useMemo(() => {
    const map: Record<string, { name: string; unitsSold: number; revenue: number }> = {};

    deliveredOrders.forEach((o) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const key = item.name;
          if (!map[key]) {
            map[key] = { name: item.name, unitsSold: 0, revenue: 0 };
          }
          map[key].unitsSold += item.quantity || 1;
          map[key].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    return Object.values(map)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 5);
  }, [deliveredOrders]);

  // Top #1 Best Seller
  const topBestSeller = useMemo(() => {
    return highSellingProducts.length > 0 ? highSellingProducts[0] : null;
  }, [highSellingProducts]);

  // 3. Monthly Financial Data & SVG Linear Graph Points
  const monthlyStats = useMemo(() => {
    const stats = MONTH_SHORT.map((m) => ({
      month: m,
      grossPlaced: 0,
      deliveredIncome: 0,
      totalOrdersCount: 0,
      deliveredOrdersCount: 0,
    }));

    filteredOrders.forEach((o) => {
      const { monthIdx } = getOrderDateInfo(o.createdAt);
      if (o.orderStatus !== "cancelled") {
        stats[monthIdx].grossPlaced += o.total || 0;
        stats[monthIdx].totalOrdersCount += 1;
      }
      if (o.orderStatus === "delivered") {
        stats[monthIdx].deliveredIncome += o.total || 0;
        stats[monthIdx].deliveredOrdersCount += 1;
      }
    });

    const maxVal = Math.max(...stats.map((s) => Math.max(s.grossPlaced, s.deliveredIncome)), 100);

    return stats.map((s) => ({
      ...s,
      grossPct: Math.max(Math.round((s.grossPlaced / maxVal) * 100), s.grossPlaced > 0 ? 10 : 4),
      deliveredPct: Math.max(Math.round((s.deliveredIncome / maxVal) * 100), s.deliveredIncome > 0 ? 10 : 4),
    }));
  }, [filteredOrders]);

  // Calculate SVG Linear Curve SVG Path (Linear Graph)
  const linearCurvePoints = useMemo(() => {
    const maxVal = Math.max(...monthlyStats.map((s) => Math.max(s.grossPlaced, s.deliveredIncome)), 100);
    const width = 1000;
    const height = 240;
    const paddingX = 40;
    const stepX = (width - paddingX * 2) / 11;

    const grossPoints = monthlyStats.map((s, idx) => {
      const x = paddingX + idx * stepX;
      const y = height - 20 - (s.grossPlaced / maxVal) * (height - 50);
      return { x, y: isNaN(y) ? height - 20 : y, amount: s.grossPlaced, month: s.month };
    });

    const deliveredPoints = monthlyStats.map((s, idx) => {
      const x = paddingX + idx * stepX;
      const y = height - 20 - (s.deliveredIncome / maxVal) * (height - 50);
      return { x, y: isNaN(y) ? height - 20 : y, amount: s.deliveredIncome, month: s.month };
    });

    const buildPathString = (pts: { x: number; y: number }[]) => {
      return pts.reduce((acc, p, idx) => {
        if (idx === 0) return `M ${p.x} ${p.y}`;
        const prev = pts[idx - 1];
        const cx1 = prev.x + stepX * 0.4;
        const cy1 = prev.y;
        const cx2 = p.x - stepX * 0.4;
        const cy2 = p.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
      }, "");
    };

    const grossPath = buildPathString(grossPoints);
    const deliveredPath = buildPathString(deliveredPoints);

    const grossAreaPath = `${grossPath} L ${grossPoints[11].x} ${height - 20} L ${grossPoints[0].x} ${height - 20} Z`;
    const deliveredAreaPath = `${deliveredPath} L ${deliveredPoints[11].x} ${height - 20} L ${deliveredPoints[0].x} ${height - 20} Z`;

    return {
      grossPoints,
      deliveredPoints,
      grossPath,
      deliveredPath,
      grossAreaPath,
      deliveredAreaPath,
      maxVal,
    };
  }, [monthlyStats]);

  // 4. Payment Gateway Breakdown
  const paymentStats = useMemo(() => {
    let bankRevenue = 0;
    let codRevenue = 0;

    deliveredOrders.forEach((o) => {
      if (o.paymentMethod === "bank") {
        bankRevenue += o.total || 0;
      } else {
        codRevenue += o.total || 0;
      }
    });

    const total = bankRevenue + codRevenue || 1;
    return {
      bankRevenue,
      bankPct: Math.round((bankRevenue / total) * 100),
      codRevenue,
      codPct: Math.round((codRevenue / total) * 100),
    };
  }, [deliveredOrders]);

  // 5. INDIVIDUAL MONTHLY PDF AUDIT REPORT (e.g. July 2026 Report)
  const downloadSpecificMonthPDF = () => {
    try {
      setIsExportingPDF(true);

      const targetMonthName = MONTH_NAMES[selectedMonthIdx];
      const targetMonthShort = MONTH_SHORT[selectedMonthIdx];

      // Filter orders strictly for the selected month and year
      const monthOrders = filteredOrders.filter((o) => {
        const { monthIdx } = getOrderDateInfo(o.createdAt);
        return monthIdx === selectedMonthIdx;
      });

      const monthDelivered = monthOrders.filter((o) => o.orderStatus === "delivered");
      const monthGross = monthOrders.filter((o) => o.orderStatus !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);
      const monthIncome = monthDelivered.reduce((s, o) => s + (o.total || 0), 0);

      let monthUnitsSold = 0;
      monthDelivered.forEach((o) => {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach((it) => (monthUnitsSold += it.quantity || 1));
        }
      });

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Title Header
      doc.setFillColor(17, 17, 17);
      doc.rect(0, 0, 210, 38, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(245, 158, 11);
      doc.text("ENDER EXCLUSIVE", 14, 16);

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`OFFICIAL MONTHLY FINANCIAL REPORT - ${targetMonthName.toUpperCase()} ${selectedYear}`, 14, 24);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 31);
      doc.text(`Audit Period: ${targetMonthName} ${selectedYear}`, 140, 31);

      // Section 1: Monthly Financial Highlights
      autoTable(doc, {
        startY: 46,
        head: [[`${targetMonthName} Financial Metric`, "Calculated Value", "Status / Notes"]],
        body: [
          ["Delivered Net Income", `Rs. ${monthIncome.toLocaleString()}`, `Collected from ${monthDelivered.length} completed delivered orders`],
          ["Delivered Units Sold", `${monthUnitsSold} Units`, "Physical products delivered to customers in " + targetMonthName],
          ["Gross Placed Sales", `Rs. ${monthGross.toLocaleString()}`, `From ${monthOrders.length} total customer orders in ` + targetMonthName],
          ["Average Order Spend (AOV)", `Rs. ${monthDelivered.length > 0 ? Math.round(monthIncome / monthDelivered.length).toLocaleString() : 0}`, "Average spend per delivered order"],
          ["Delivery Fulfillment Rate", `${monthOrders.length > 0 ? Math.round((monthDelivered.length / monthOrders.length) * 100) : 0}%`, `${monthDelivered.length} Delivered / ${monthOrders.length} Placed`],
        ],
        theme: "striped",
        headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0], fontStyle: "bold" },
        styles: { font: "helvetica", fontSize: 9 },
      });

      // Section 2: Detailed Delivered Orders Itemized Table
      const currentY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 17, 17);
      doc.text(`Itemized Orders List (${targetMonthName} ${selectedYear})`, 14, currentY);

      const orderRows = monthOrders.map((o) => [
        `#${o.orderNo || o.id.slice(0, 8).toUpperCase()}`,
        o.customerName || "Customer",
        o.paymentMethod?.toUpperCase() || "COD",
        o.orderStatus.toUpperCase(),
        `${o.items?.length || 1} Items`,
        `Rs. ${o.total.toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Order ID", "Customer", "Payment", "Status", "Items", "Total (Rs.)"]],
        body: orderRows.length > 0 ? orderRows : [["-", "No orders recorded in " + targetMonthName, "-", "-", "-", "Rs. 0"]],
        theme: "grid",
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { font: "helvetica", fontSize: 8.5 },
      });

      // Section 3: Prominent Final Monthly Income & Sales Audit Summary Box
      const finalY = (doc as any).lastAutoTable.finalY + 10;

      // Draw Amber Highlight Box Background
      doc.setFillColor(245, 158, 11);
      doc.rect(14, finalY, 182, 38, "F");

      // Draw Inner Border
      doc.setDrawColor(17, 17, 17);
      doc.setLineWidth(0.5);
      doc.rect(14, finalY, 182, 38, "S");

      // Summary Box Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`OFFICIAL FINANCIAL AUDIT SUMMARY - ${targetMonthName.toUpperCase()} ${selectedYear}`, 20, finalY + 9);

      doc.setFontSize(13);
      doc.text(`TOTAL DELIVERED NET INCOME FOR ${targetMonthName.toUpperCase()}: Rs. ${monthIncome.toLocaleString()}`, 20, finalY + 18);

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text(`- Total Physical Product Units Sold in ${targetMonthName}: ${monthUnitsSold} Units`, 20, finalY + 26);
      doc.text(`- Total Completed Delivered Orders: ${monthDelivered.length} Orders (Out of ${monthOrders.length} placed orders)`, 20, finalY + 32);

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Ender Exclusive Official Portal Report - Page ${i} of ${pageCount}`, 14, 287);
      }

      doc.save(`Ender_Exclusive_${targetMonthName}_${selectedYear}_Sales_Report.pdf`);
      triggerToast(`${targetMonthName} ${selectedYear} Monthly PDF Report downloaded successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to export Monthly PDF report.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // FULL YEAR AUDIT PDF REPORT
  const downloadFullYearPDF = () => {
    try {
      setIsExportingPDF(true);
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      doc.setFillColor(17, 17, 17);
      doc.rect(0, 0, 210, 38, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(245, 158, 11);
      doc.text("ENDER EXCLUSIVE", 14, 16);

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`FULL YEAR FINANCIAL AUDIT REPORT - YEAR ${selectedYear.toUpperCase()}`, 14, 24);

      autoTable(doc, {
        startY: 46,
        head: [["Annual Indicator", "Value"]],
        body: [
          ["Total Delivered Net Income", `Rs. ${deliveredIncome.toLocaleString()}`],
          ["Total Delivered Product Units", `${deliveredUnitsCount} Units`],
          ["Gross Placed Revenue", `Rs. ${grossPlacedRevenue.toLocaleString()}`],
          ["Average Order Spend (AOV)", `Rs. ${Math.round(avgDeliveredOrderValue).toLocaleString()}`],
          ["Delivery Fulfillment Rate", `${deliveryCompletionRate}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0], fontStyle: "bold" },
      });

      const currentY = (doc as any).lastAutoTable.finalY + 10;
      const rows = monthlyStats.map((m) => [
        m.month,
        `${m.totalOrdersCount} Orders`,
        `Rs. ${m.grossPlaced.toLocaleString()}`,
        `${m.deliveredOrdersCount} Delivered`,
        `Rs. ${m.deliveredIncome.toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Month", "Total Orders", "Gross Revenue (Rs.)", "Delivered Orders", "Delivered Income (Rs.)"]],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold" },
      });

      doc.save(`Ender_Exclusive_${selectedYear}_Full_Year_Report.pdf`);
      triggerToast(`Full Year ${selectedYear} Financial Report downloaded successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to export Full Year PDF report.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans">
        <div className="relative bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl border border-white/20 dark:border-[#2A2A2A]/60 rounded-3xl p-16 text-center shadow-2xl shadow-black/5">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-base font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
            Calculating Sales Analytics & Building Smooth Curves...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-zinc-950 dark:bg-white text-white dark:text-black px-6 py-4 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 font-extrabold text-sm flex items-center gap-3"
          >
            <HiOutlineSparkles className="w-5 h-5 text-amber-400 dark:text-amber-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 1. HEADER & DOWNLOAD REPORT SUITE ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0D0D0D] border border-white/30 dark:border-[#2A2A2A]/50 shadow-2xl shadow-black/5 p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">
              <span>Portal</span>
              <HiOutlineChevronRight className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-900 dark:text-white font-extrabold">Sales & Income Analytics</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              Store <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Analytics</span>
            </h1>
            <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              Automatic calculation of delivered net income, linear trend curve diagrams, and month-by-month PDF report downloads.
            </p>
          </div>

          {/* DEDICATED PDF DOWNLOAD BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Download Specific Selected Month PDF */}
            <button
              onClick={downloadSpecificMonthPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-2.5 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isExportingPDF ? <FaSpinner className="w-4 h-4 animate-spin" /> : <HiOutlineDocumentArrowDown className="w-5 h-5" />}
              <span>Download {MONTH_NAMES[selectedMonthIdx]} PDF Report</span>
            </button>

            {/* Download Full Year Report PDF */}
            <button
              onClick={downloadFullYearPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-2 px-5 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              <HiOutlineCalendar className="w-4.5 h-4.5" />
              <span>Full Year {selectedYear} PDF</span>
            </button>
          </div>
        </div>

        {/* MONTH & YEAR FILTER RIBBON */}
        <div className="mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-4">
          {/* Specific Month Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <HiOutlineCalendar className="w-4 h-4 text-amber-500" />
              Select Month for PDF Report:
            </span>
            <select
              value={selectedMonthIdx}
              onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-xs font-extrabold outline-none border border-zinc-200 dark:border-zinc-700 cursor-pointer"
            >
              {MONTH_NAMES.map((mName, idx) => (
                <option key={mName} value={idx}>
                  {mName} {selectedYear}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 mr-2">Year:</span>
            {["2024", "2025", "2026", "2027", "all"].map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${selectedYear === y
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
              >
                {y === "all" ? "All Time" : y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 2. FINANCIAL & DELIVERED SALES KPI STAT CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Delivered Net Income */}
        <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Delivered Net Income</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <HiOutlineCheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl lg:text-4xl font-black font-mono text-zinc-900 dark:text-white mt-4">
            Rs. {deliveredIncome.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-emerald-500 mt-2 flex items-center gap-1">
            <HiOutlineArrowTrendingUp className="w-4 h-4" />
            Money earned from {deliveredOrders.length} delivered orders
          </p>
        </div>

        {/* Delivered Product Items Sold Count */}
        <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Delivered Units Sold</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <HiOutlineCube className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl lg:text-4xl font-black font-mono text-zinc-900 dark:text-white mt-4">
            {deliveredUnitsCount} <span className="text-base font-bold text-zinc-400">Items</span>
          </p>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-2">
            Physical product units delivered to customers
          </p>
        </div>

        {/* Gross Placed Sales (Rs.) */}
        <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Gross Placed Sales</span>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <HiOutlineBanknotes className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl lg:text-4xl font-black font-mono text-zinc-900 dark:text-white mt-4">
            Rs. {grossPlacedRevenue.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-amber-500 mt-2">
            From all {validOrders.length} valid customer orders
          </p>
        </div>

        {/* Average Spend per Delivered Order */}
        <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Avg Delivered Order</span>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <HiOutlineChartBar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl lg:text-4xl font-black font-mono text-zinc-900 dark:text-white mt-4">
            Rs. {Math.round(avgDeliveredOrderValue).toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-zinc-400 mt-2">
            Average revenue earned per fulfilled order
          </p>
        </div>
      </div>

      {/* ===== 3. LINEAR SMOOTH CURVE TREND DIAGRAM GRAPH ===== */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-8 shadow-xl shadow-black/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <HiOutlineArrowTrendingUp className="w-6 h-6 text-amber-500" />
              Linear Trend Curve Diagram ({selectedYear.toUpperCase()})
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Smooth linear trajectory comparing Gross Placed Revenue vs Net Delivered Income.
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* Graph Style Selector Toggle */}
            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setGraphType("linear")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${graphType === "linear" ? "bg-amber-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
                  }`}
              >
                Linear Trend Curve
              </button>
              <button
                onClick={() => setGraphType("bar")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${graphType === "bar" ? "bg-amber-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
                  }`}
              >
                Bar Diagram
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-black uppercase">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Gross Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Delivered Income</span>
              </div>
            </div>
          </div>
        </div>

        {/* LINEAR SVG TREND CURVE GRAPH */}
        {graphType === "linear" ? (
          <div className="relative pt-6 pb-2 overflow-x-auto">
            <svg viewBox="0 0 1000 260" className="w-full h-64 overflow-visible">
              <defs>
                <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="960" y2="20" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="4 4" />
              <line x1="40" y1="120" x2="960" y2="120" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="4 4" />
              <line x1="40" y1="220" x2="960" y2="220" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />

              {/* Area Fills */}
              <path d={linearCurvePoints.grossAreaPath} fill="url(#grossGradient)" />
              <path d={linearCurvePoints.deliveredAreaPath} fill="url(#deliveredGradient)" />

              {/* Linear Smooth Stroke Lines */}
              <path d={linearCurvePoints.grossPath} fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
              <path d={linearCurvePoints.deliveredPath} fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />

              {/* Interactive Data Nodes */}
              {linearCurvePoints.grossPoints.map((p, i) => (
                <g key={`gross-${i}`} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="5" fill="#F59E0B" stroke="#ffffff" strokeWidth="2" className="transition-all group-hover:r-7" />
                  <circle cx={linearCurvePoints.deliveredPoints[i].x} cy={linearCurvePoints.deliveredPoints[i].y} r="5" fill="#10B981" stroke="#ffffff" strokeWidth="2" className="transition-all group-hover:r-7" />

                  {/* X Axis Month Labels */}
                  <text x={p.x} y="245" textAnchor="middle" className="fill-zinc-400 font-bold text-[11px] uppercase">
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          /* BAR DIAGRAM FALLBACK */
          <div className="pt-8 pb-4">
            <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              {monthlyStats.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${m.grossPct}%` }}
                      className="w-full max-w-[16px] bg-amber-500 rounded-t-lg group-hover:brightness-110 transition-all shadow-md"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${m.deliveredPct}%` }}
                      className="w-full max-w-[16px] bg-emerald-500 rounded-t-lg group-hover:brightness-110 transition-all shadow-md"
                    />
                  </div>
                  <span className="text-xs font-black uppercase text-zinc-400 mt-2">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== 4. HIGH-SELLING PRODUCTS & PAYMENT GATEWAY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* High-Selling Products Leaderboard */}
        <div className="lg:col-span-2 relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-8 shadow-xl shadow-black/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <HiOutlineCube className="w-6 h-6 text-amber-500" />
              High-Selling Products Leaderboard
            </h2>
            <span className="text-xs font-bold uppercase text-zinc-400">Ranked by Delivered Units</span>
          </div>

          <div className="space-y-4">
            {highSellingProducts.length > 0 ? (
              highSellingProducts.map((p, idx) => (
                <div
                  key={p.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 border border-white/20 dark:border-zinc-800/60 rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-2xl bg-amber-400 text-black font-black text-base flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-base text-zinc-900 dark:text-white">
                        {p.name}
                      </p>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                        Delivered Catalog Item
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase text-zinc-400">Units Sold</p>
                      <p className="text-lg font-mono font-black text-amber-500 mt-0.5">
                        {p.unitsSold} <span className="text-xs font-bold text-zinc-400">Units</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold uppercase text-zinc-400">Delivered Income</p>
                      <p className="text-lg font-mono font-black text-zinc-900 dark:text-white mt-0.5">
                        Rs. {p.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-400 font-bold">
                No delivered order sales recorded yet for year {selectedYear}. Mark orders as &quot;Delivered&quot; in the Orders section to view product sales metrics.
              </div>
            )}
          </div>
        </div>

        {/* Payment Gateway Breakdown */}
        <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-8 shadow-xl shadow-black/5 space-y-6">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <HiOutlineCreditCard className="w-6 h-6 text-purple-500" />
            Delivered Payment Gateway
          </h2>

          <div className="space-y-6">
            <div className="p-5 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 border border-white/20 dark:border-zinc-800/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-sm font-extrabold">
                <span className="text-zinc-900 dark:text-white">Bank Account Transfer</span>
                <span className="text-amber-500 font-mono">{paymentStats.bankPct}%</span>
              </div>
              <p className="text-2xl font-mono font-black text-zinc-900 dark:text-white">
                Rs. {paymentStats.bankRevenue.toLocaleString()}
              </p>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${paymentStats.bankPct}%` }} />
              </div>
            </div>

            <div className="p-5 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 border border-white/20 dark:border-zinc-800/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-sm font-extrabold">
                <span className="text-zinc-900 dark:text-white">Cash on Delivery (COD)</span>
                <span className="text-emerald-500 font-mono">{paymentStats.codPct}%</span>
              </div>
              <p className="text-2xl font-mono font-black text-zinc-900 dark:text-white">
                Rs. {paymentStats.codRevenue.toLocaleString()}
              </p>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${paymentStats.codPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
