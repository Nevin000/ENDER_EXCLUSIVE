"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, adminAuth, db, adminDb } from "@/firebase/config";
import { Product } from "@/types/product";
import AnimatedCounter from "@/components/admin/AnimatedCounter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineCube,
  HiOutlineEye,
  HiOutlineDocumentArrowDown,
  HiOutlineExclamationTriangle,
  HiOutlineGlobeAlt,
  HiOutlineXCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlineChevronRight as HiChevronRightIcon,
  HiOutlineArrowPath,
  HiOutlineTag,
  HiOutlineBolt,
  HiOutlineTruck,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBuildingStorefront,
} from "react-icons/hi2";
import { FaFire, FaTag, FaTruck, FaPercent } from "react-icons/fa";

export default function ProductsPage() {
  const router = useRouter();

  // ⚡ Real-Time Firestore State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [selectedSaleStatus, setSelectedSaleStatus] = useState("all"); // "all" | "sale" | "regular"
  const [sortBy, setSortBy] = useState<"newest" | "priceLow" | "priceHigh" | "name" | "stock">("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal & Detail Preview State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Action Loading & PDF Export State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ⚡ Realtime Firestore Subscription
  useEffect(() => {
    setLoading(true);
    const activeDb = adminAuth.currentUser ? adminDb : db;
    const unsub = onSnapshot(
      collection(activeDb, "products"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error in products realtime subscription:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // 🧮 Summary KPI Statistics
  const kpiStats = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.status === "active").length;
    const onSale = products.filter((p) => p.isOnSale || (p.salePrice && p.salePrice < p.price)).length;
    const lowStock = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
    const outOfStock = products.filter((p) => (p.stock || 0) === 0).length;

    return { total, published, onSale, lowStock, outOfStock };
  }, [products]);

  // Unique Categories List
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return cats.sort();
  }, [products]);

  // 🔍 Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.id?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          ((p as any).sku && (p as any).sku.toLowerCase().includes(term))
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      result = result.filter((p) => (p.status || "active") === selectedStatus);
    }

    if (selectedSaleStatus !== "all") {
      if (selectedSaleStatus === "sale") {
        result = result.filter((p) => p.isOnSale || (p.salePrice && p.salePrice < p.price));
      } else if (selectedSaleStatus === "regular") {
        result = result.filter((p) => !p.isOnSale && (!p.salePrice || p.salePrice >= p.price));
      }
    }

    if (selectedStockStatus !== "all") {
      if (selectedStockStatus === "inStock") {
        result = result.filter((p) => (p.stock || 0) > 5);
      } else if (selectedStockStatus === "lowStock") {
        result = result.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5);
      } else if (selectedStockStatus === "outOfStock") {
        result = result.filter((p) => (p.stock || 0) === 0);
      }
    }

    result.sort((a, b) => {
      const getEffectivePrice = (p: Product) => (p.isOnSale && p.salePrice ? p.salePrice : p.price || 0);

      if (sortBy === "newest") {
        const timeA = (a as any).createdAt?.seconds || 0;
        const timeB = (b as any).createdAt?.seconds || 0;
        return timeB - timeA;
      }
      if (sortBy === "priceLow") return getEffectivePrice(a) - getEffectivePrice(b);
      if (sortBy === "priceHigh") return getEffectivePrice(b) - getEffectivePrice(a);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "stock") return (b.stock || 0) - (a.stock || 0);
      return 0;
    });

    return result;
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedStockStatus, selectedSaleStatus, sortBy]);

  // 📄 Pagination Slicing
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, selectedStockStatus, selectedSaleStatus, sortBy, itemsPerPage]);

  // 🛠️ Row Action Handlers
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      setActionLoadingId(id);
      await deleteDoc(doc(db, "products", id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      triggerToast(`Product "${name}" deleted successfully.`);
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTogglePublishStatus = async (product: Product) => {
    const newStatus = product.status === "active" ? "draft" : "active";
    try {
      setActionLoadingId(product.id);
      await updateDoc(doc(db, "products", product.id), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
      triggerToast(`"${product.name}" status updated to ${newStatus === "active" ? "Published" : "Draft"}.`);
    } catch (err) {
      console.error("Error toggling product status:", err);
      alert("Failed to update product status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 📄 Export to PDF Feature
  const handleExportPDF = async (targetItems = filteredProducts) => {
    const exportList = targetItems.length > 0 ? targetItems : filteredProducts;

    if (exportList.length === 0) return alert("No products available to export as PDF.");

    try {
      setIsExportingPDF(true);
      triggerToast("Generating Product Catalog PDF...");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Title Header Background Banner
      doc.setFillColor(17, 17, 17);
      doc.rect(0, 0, 210, 36, "F");

      // Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(245, 158, 11);
      doc.text("ENDER EXCLUSIVE", 14, 15);

      // Report Subtitle
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("OFFICIAL PRODUCTS CATALOG AUDIT REPORT", 14, 23);

      // Report Metadata
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Items: ${exportList.length}`, 140, 30);

      // Executive Summary Metrics Table
      const totalValuation = exportList.reduce((sum, p) => {
        const effPrice = p.isOnSale && p.salePrice ? p.salePrice : p.price || 0;
        return sum + effPrice * (p.stock || 0);
      }, 0);

      const activeCount = exportList.filter((p) => p.status === "active").length;
      const saleCount = exportList.filter((p) => p.isOnSale || (p.salePrice && p.salePrice < p.price)).length;
      const lowStockCount = exportList.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
      const outStockCount = exportList.filter((p) => (p.stock || 0) === 0).length;

      autoTable(doc, {
        startY: 42,
        head: [["Catalog Summary Metric", "Value", "Notes"]],
        body: [
          ["Total Products Exported", `${exportList.length} Products`, "Active catalog inventory list"],
          ["Active / Published Products", `${activeCount} Items`, `${Math.round((activeCount / (exportList.length || 1)) * 100)}% storefront visibility`],
          ["On Sale Discounted Items", `${saleCount} Items`, `${Math.round((saleCount / (exportList.length || 1)) * 100)}% on promotion`],
          ["Low Stock Warning (1-5 units)", `${lowStockCount} Items`, "Requires stock replenishment"],
          ["Out of Stock (0 units)", `${outStockCount} Items`, "Inventory exhausted"],
          ["Estimated Total Valuation", `Rs. ${totalValuation.toLocaleString()}`, "Effective Price x Stock valuation"],
        ],
        theme: "striped",
        headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0], fontStyle: "bold" },
        styles: { font: "helvetica", fontSize: 8.5 },
      });

      // Products Itemized Data Table
      const currentY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(17, 17, 17);
      doc.text("ITEMIZED PRODUCT CATALOG", 14, currentY);

      const tableRows = exportList.map((p, idx) => {
        const sku = (p as any).sku || p.id.slice(0, 8).toUpperCase();
        const isOnSale = p.isOnSale || (p.salePrice && p.salePrice < p.price);
        const priceDisplay = isOnSale && p.salePrice
          ? `Rs. ${p.salePrice.toLocaleString()} (Was Rs. ${p.price.toLocaleString()})`
          : `Rs. ${(p.price || 0).toLocaleString()}`;

        const saleBadge = isOnSale ? "ON SALE" : "REGULAR";

        const createdDateStr = (p as any).createdAt
          ? new Date(((p as any).createdAt.seconds ? (p as any).createdAt.seconds * 1000 : (p as any).createdAt)).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          : "N/A";

        return [
          (idx + 1).toString(),
          p.name || "Untitled",
          sku,
          p.category || "General",
          priceDisplay,
          saleBadge,
          `${p.stock || 0} units`,
          p.status === "active" ? "Active" : "Hidden",
          createdDateStr,
        ];
      });

      autoTable(doc, {
        startY: currentY + 4,
        head: [["#", "Product Name", "SKU", "Category", "Pricing", "Offer", "Stock", "Status", "Date"]],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
        styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2 },
      });

      // Save PDF Document
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`Ender_Exclusive_Catalog_Report_${dateStr}.pdf`);
      triggerToast(`Exported ${exportList.length} product(s) to PDF.`);
    } catch (err) {
      console.error("Error exporting PDF report:", err);
      alert("Failed to export PDF report.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Bulk Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected product(s)?`)) return;

    try {
      setLoading(true);
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        batch.delete(doc(db, "products", id));
      });
      await batch.commit();
      triggerToast(`Deleted ${selectedIds.length} product(s).`);
      setSelectedIds([]);
    } catch (err) {
      console.error("Error performing bulk deletion:", err);
      alert("Failed to delete selected products.");
    } finally {
      setLoading(false);
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedCategory !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (selectedStockStatus !== "all") count++;
    if (selectedSaleStatus !== "all") count++;
    if (sortBy !== "newest") count++;
    return count;
  }, [searchTerm, selectedCategory, selectedStatus, selectedStockStatus, selectedSaleStatus, sortBy]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedStockStatus("all");
    setSelectedSaleStatus("all");
    setSortBy("newest");
  };

  const allPaginatedSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id));

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans selection:bg-amber-400 selection:text-black">
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

      {/* ===== 1. HERO & HEADER BAR ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black dark:from-[#111111] dark:via-[#18181B] dark:to-[#0D0D0D] text-white border border-zinc-800 dark:border-[#2A2A2A]/50 shadow-2xl p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-amber-400 mb-2">
              <span>Admin Portal</span>
              <HiChevronRightIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-200">Products Catalog</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
              Products <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-sm md:text-base font-medium text-zinc-400 mt-2.5 max-w-2xl leading-relaxed">
              Real-time product inventory control, catalog pricing, visibility rules, stock level monitoring, On Sale promotions, and PDF report download.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            {/* Download PDF Option */}
            <button
              onClick={() => handleExportPDF()}
              disabled={isExportingPDF}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-zinc-800/80 hover:bg-zinc-700/80 disabled:opacity-50 text-white border border-zinc-700/60 rounded-2xl text-xs md:text-sm font-extrabold uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
              title="Download Product Catalog PDF Report"
            >
              {isExportingPDF ? (
                <HiOutlineArrowPath className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <HiOutlineDocumentArrowDown className="w-5 h-5 text-amber-400" />
              )}
              <span>{isExportingPDF ? "Exporting..." : "Download PDF"}</span>
            </button>

            {/* Add New Product */}
            <Link
              href="/admin/products/add"
              className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold rounded-2xl text-xs md:text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <HiOutlinePlus className="w-5 h-5 stroke-[2.5]" />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== 2. MODERN KPI CARDS (SINGLE ROW ON DESKTOP) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
        {/* Card 1: Total Products */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <HiOutlineCube className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
              Catalog
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Total Products
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.total} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              Total database count
            </p>
          </div>
        </motion.div>

        {/* Card 2: Active / Published */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <HiOutlineGlobeAlt className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
              Active
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Active Products
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.published} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              Visible in shop
            </p>
          </div>
        </motion.div>

        {/* Card 3: On Sale Products */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <FaFire className="w-4 h-4 text-rose-500" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
              On Sale
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              On Sale Items
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.onSale} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              Discounted pricing active
            </p>
          </div>
        </motion.div>

        {/* Card 4: Low Stock Warning */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <HiOutlineExclamationTriangle className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              Low Stock
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Low Stock Alert
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-amber-500 mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.lowStock} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              1 to 5 units remaining
            </p>
          </div>
        </motion.div>

        {/* Card 5: Out of Stock */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
              <HiOutlineXCircle className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300">
              Critical
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Out of Stock
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-zinc-700 dark:text-zinc-300 mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.outOfStock} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              0 units remaining
            </p>
          </div>
        </motion.div>
      </div>

      {/* ===== 3. INTERACTIVE CONTROL BAR ===== */}
      <div className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-[360px]">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 dark:focus:border-amber-400 rounded-2xl text-sm font-bold outline-none transition-all text-zinc-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white p-1"
              >
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 rounded-2xl text-xs md:text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Sale Status Filter */}
            <select
              value={selectedSaleStatus}
              onChange={(e) => setSelectedSaleStatus(e.target.value)}
              className="px-4 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 rounded-2xl text-xs md:text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Promotions</option>
              <option value="sale">🔥 On Sale Only ({kpiStats.onSale})</option>
              <option value="regular">Regular Price</option>
            </select>

            {/* Visibility Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 rounded-2xl text-xs md:text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Visibility</option>
              <option value="active">Active / Published</option>
              <option value="draft">Draft / Hidden</option>
            </select>

            {/* Stock Filter */}
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="px-4 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 rounded-2xl text-xs md:text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Stock Status</option>
              <option value="inStock">In Stock (&gt; 5)</option>
              <option value="lowStock">Low Stock (1-5)</option>
              <option value="outOfStock">Out of Stock (0)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 rounded-2xl text-xs md:text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="priceLow">Sort: Price Low to High</option>
              <option value="priceHigh">Sort: Price High to Low</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="stock">Sort: Highest Stock</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
              >
                <HiOutlineArrowPath className="w-4 h-4" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== FLOATING BULK ACTIONS BAR ===== */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-6 z-40 bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur-md text-white border border-zinc-700/80 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 px-3">
              <span className="w-7 h-7 rounded-full bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span className="text-xs md:text-sm font-bold">
                {selectedIds.length} product(s) selected
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const targetItems = products.filter((p) => selectedIds.includes(p.id));
                  handleExportPDF(targetItems);
                }}
                disabled={isExportingPDF}
                className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
              >
                {isExportingPDF ? (
                  <HiOutlineArrowPath className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <HiOutlineDocumentArrowDown className="w-4 h-4 text-amber-400" />
                )}
                <span>Export Selected PDF</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
              >
                <HiOutlineTrash className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-2.5 text-zinc-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 4. PRODUCTION PRODUCTS TABLE (INCLUDING ON SALE BADGE) ===== */}
      <div className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-zinc-400">Loading catalog items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-[#18181B] flex items-center justify-center mx-auto text-zinc-400">
              <HiOutlineCube className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              No Products Found
            </h3>
            <p className="text-sm font-medium text-zinc-400 max-w-md mx-auto">
              No catalog items match your search or filter criteria. Try clearing active filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Sticky Header */}
              <thead className="sticky top-0 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-200/80 dark:border-zinc-800 text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-5 w-14 text-center">
                    <input
                      type="checkbox"
                      checked={allPaginatedSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-5">Product</th>
                  <th className="px-6 py-5">SKU</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Price & Offer</th>
                  <th className="px-6 py-5">Stock Status</th>
                  <th className="px-6 py-5">Visibility</th>
                  <th className="px-6 py-5">Created Date</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Rows */}
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-base font-medium text-zinc-900 dark:text-zinc-100">
                {paginatedProducts.map((product) => {
                  const stockNum = product.stock || 0;
                  const coverImage =
                    product.images?.[0] ||
                    product.colorImages?.[0]?.url ||
                    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200";

                  const isLowStock = stockNum > 0 && stockNum <= 5;
                  const isOutOfStock = stockNum === 0;
                  const isOnSale = product.isOnSale || (product.salePrice && product.salePrice < product.price);
                  const effectivePrice = isOnSale && product.salePrice ? product.salePrice : product.price || 0;
                  const discountPercent = product.discountPercentage || (product.price && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0);

                  const createdDateStr = (product as any).createdAt
                    ? new Date(((product as any).createdAt.seconds ? (product as any).createdAt.seconds * 1000 : (product as any).createdAt)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "N/A";

                  const isSelected = selectedIds.includes(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${isSelected
                        ? "bg-amber-50/40 dark:bg-amber-950/20"
                        : "hover:bg-zinc-50/80 dark:hover:bg-[#161618]"
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(product.id, e.target.checked)}
                          className="w-5 h-5 rounded border-zinc-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      {/* Product Image & Name + On Sale Badge */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-5">
                          <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-md">
                            <img
                              src={coverImage}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                            {isOnSale && (
                              <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                                <FaFire className="text-[9px]" /> SALE
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg md:text-xl text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                                {product.name}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-zinc-400 font-medium tracking-wide">
                                ID: {product.id.slice(0, 10)}
                              </span>
                              {isOnSale && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                                  🔥 ON SALE {discountPercent > 0 ? `(-${discountPercent}%)` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-5 font-mono text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-300">
                        {(product as any).sku || product.id.slice(0, 8).toUpperCase()}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-[#1A1A1E] text-zinc-800 dark:text-zinc-200 text-sm font-medium rounded-full uppercase tracking-wide">
                          <HiOutlineTag className="w-4 h-4 text-amber-500" />
                          <span>{product.category || "General"}</span>
                        </span>
                      </td>

                      {/* Price & Offer Column */}
                      <td className="px-6 py-5 font-mono">
                        {isOnSale ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg md:text-xl text-rose-600 dark:text-rose-400">
                                Rs. {effectivePrice.toLocaleString()}
                              </span>
                              {discountPercent > 0 && (
                                <span className="text-xs font-extrabold text-rose-600 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
                                  -{discountPercent}%
                                </span>
                              )}
                            </div>
                            <span className="text-xs md:text-sm text-zinc-400 line-through font-medium block">
                              Rs. {(product.price || 0).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-lg md:text-xl text-zinc-900 dark:text-white">
                            Rs. {(product.price || 0).toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Status Pill */}
                      <td className="px-6 py-5 font-mono text-sm md:text-base font-medium">
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-full text-xs md:text-sm font-semibold uppercase border ${isOutOfStock
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
                            : isLowStock
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                            }`}
                        >
                          {isOutOfStock ? "Out of Stock (0)" : isLowStock ? `Low Stock (${stockNum})` : `In Stock (${stockNum})`}
                        </span>
                      </td>

                      {/* Visibility Status */}
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleTogglePublishStatus(product)}
                          className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold uppercase border transition-all cursor-pointer ${product.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 hover:bg-zinc-200"
                            }`}
                          title="Click to toggle status"
                        >
                          {product.status === "active" ? "Active" : "Hidden"}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-5 text-sm md:text-base font-mono font-medium text-zinc-500 dark:text-zinc-400">
                        {createdDateStr}
                      </td>

                      {/* Table Row Actions */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Quick View Preview Button */}
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setActiveImageIndex(0);
                              setIsPreviewOpen(true);
                            }}
                            className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-[#1D1D20] text-zinc-700 dark:text-zinc-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition shadow-sm cursor-pointer"
                            title="Quick View Product Details"
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </button>

                          {/* Edit Product */}
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-[#1D1D20] text-zinc-700 dark:text-zinc-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition shadow-sm cursor-pointer"
                            title="Edit Product"
                          >
                            <HiOutlinePencilSquare className="w-5 h-5" />
                          </Link>

                          {/* Delete Product */}
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
                            title="Delete Product"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== 5. PAGINATION BAR ===== */}
      <div className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-500">
        <div className="flex items-center gap-4">
          <span>
            Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
          </span>

          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-1.5 bg-zinc-100 dark:bg-[#18181B] border border-transparent rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition cursor-pointer"
          >
            <HiOutlineChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 font-mono font-extrabold text-xs text-zinc-900 dark:text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition cursor-pointer"
          >
            <HiOutlineChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===== 6. COMPREHENSIVE QUICK VIEW INSPECTION MODAL ===== */}
      <AnimatePresence>
        {isPreviewOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-4xl shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-500">
                      Product Full Details Audit
                    </span>
                    {(selectedProduct.isOnSale || (selectedProduct.salePrice && selectedProduct.salePrice < selectedProduct.price)) && (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                        <FaFire className="text-rose-500" /> ON SALE OFFER
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
                    <span>ID: {selectedProduct.id}</span>
                    <span>•</span>
                    <span>SKU: {(selectedProduct as any).sku || selectedProduct.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition cursor-pointer bg-zinc-100 dark:bg-zinc-800"
                >
                  <HiOutlineXMark className="w-6 h-6" />
                </button>
              </div>

              {/* Grid Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
                {/* Left Column: Image Gallery & Previews */}
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
                    <img
                      src={
                        selectedProduct.images?.[activeImageIndex] ||
                        selectedProduct.colorImages?.[activeImageIndex]?.url ||
                        selectedProduct.images?.[0] ||
                        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500"
                      }
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnail List */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div>
                      <p className="text-xs uppercase text-zinc-400 font-bold mb-2">Catalog Gallery ({selectedProduct.images.length})</p>
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                        {selectedProduct.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${activeImageIndex === idx ? "border-amber-400 scale-105" : "border-transparent opacity-60"
                              }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Complete Specs & Details */}
                <div className="space-y-6">
                  {/* Price & Discount Section */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                    <p className="text-xs uppercase text-zinc-400 font-bold">Pricing Breakdown</p>
                    <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
                      {selectedProduct.isOnSale || (selectedProduct.salePrice && selectedProduct.salePrice < selectedProduct.price) ? (
                        <>
                          <span className="text-3xl md:text-4xl font-mono font-bold text-rose-600 dark:text-rose-400">
                            Rs. {(selectedProduct.salePrice || selectedProduct.price).toLocaleString()}
                          </span>
                          <span className="text-lg font-mono text-zinc-400 line-through">
                            Rs. {(selectedProduct.price || 0).toLocaleString()}
                          </span>
                          {selectedProduct.discountPercentage ? (
                            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-full">
                              -{selectedProduct.discountPercentage}% OFF
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-3xl md:text-4xl font-mono font-bold text-amber-500">
                          Rs. {(selectedProduct.price || 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock & Inventory Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                      <p className="text-xs uppercase text-zinc-400 font-bold">Total Stock</p>
                      <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-white mt-1">
                        {selectedProduct.stock || 0} Units
                      </p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                      <p className="text-xs uppercase text-zinc-400 font-bold">Visibility Status</p>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {selectedProduct.status === "active" ? "Active / Published" : "Hidden / Draft"}
                      </span>
                    </div>
                  </div>

                  {/* Size Breakdown (If sizes available) */}
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-zinc-400 font-bold mb-2">Per-Size Stock Breakdown</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((sz, idx) => (
                          <div
                            key={idx}
                            className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                          >
                            <span className="uppercase text-amber-500">{sz.size}:</span>
                            <span>{sz.stock} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Colors */}
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-zinc-400 font-bold mb-2">Available Colors</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map((clr, idx) => (
                          <span
                            key={idx}
                            className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-semibold rounded-full capitalize border border-zinc-200 dark:border-zinc-700"
                          >
                            {clr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category & Tags */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-zinc-400 font-bold">Category & Metadata</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full uppercase border border-amber-200 dark:border-amber-800">
                        Category: {selectedProduct.category || "General"}
                      </span>

                      {selectedProduct.gender && (
                        <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-full uppercase">
                          Gender: {selectedProduct.gender}
                        </span>
                      )}

                      {selectedProduct.season && (
                        <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-full uppercase">
                          Season: {selectedProduct.season}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Charges Info */}
                  <div>
                    <p className="text-xs uppercase text-zinc-400 font-bold">Delivery Terms</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1 flex items-center gap-2">
                      <HiOutlineTruck className="w-4 h-4 text-emerald-500" />
                      {selectedProduct.deliveryType === "free" || !selectedProduct.deliveryCharge
                        ? "FREE Shipping / Delivery included"
                        : `Standard Shipping Fee: Rs. ${selectedProduct.deliveryCharge.toLocaleString()}`}
                    </p>
                  </div>

                  {/* Full Description */}
                  {selectedProduct.description && (
                    <div>
                      <p className="text-xs uppercase text-zinc-400 font-bold">Product Description</p>
                      <p className="text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed mt-1 text-xs md:text-sm bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/products/edit/${selectedProduct.id}`}
                    className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black text-xs md:text-sm font-extrabold uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <HiOutlinePencilSquare className="w-4 h-4" />
                    <span>Edit Product Details</span>
                  </Link>

                  <a
                    href={`/shop/${selectedProduct.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs md:text-sm font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                    <span>View on Storefront</span>
                  </a>
                </div>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-7 py-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black text-xs md:text-sm font-extrabold uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                >
                  Close Audit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
