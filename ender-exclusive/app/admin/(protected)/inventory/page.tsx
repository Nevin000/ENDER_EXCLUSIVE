"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Product } from "@/types/product";
import AnimatedCounter from "@/components/admin/AnimatedCounter";

import {
  HiOutlineCube,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineCheckCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineCheck,
  HiOutlinePencilSquare,
  HiOutlineBanknotes,
} from "react-icons/hi2";

import { FaSpinner, FaBoxes } from "react-icons/fa";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  // Inline editing state: { [productId]: stockNumber }
  const [editingStocks, setEditingStocks] = useState<{ [key: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Subscribe to Live Firestore Products
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, "id">),
        }));
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error in inventory realtime subscription:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // 2. Computed KPI Metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    let totalUnits = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const stock = p.stock || 0;
      const price = p.isOnSale && p.salePrice ? p.salePrice : p.price || 0;
      totalUnits += stock;
      totalValue += stock * price;

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= 5) {
        lowStockCount++;
      }
    });

    return {
      totalProducts,
      totalUnits,
      totalValue,
      lowStockCount,
      outOfStockCount,
    };
  }, [products]);

  // 3. Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const nameMatch = (product.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const catMatch = (product.category || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || catMatch;

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

      const stock = product.stock || 0;
      let matchesStock = true;
      if (stockFilter === "in_stock") matchesStock = stock > 5;
      if (stockFilter === "low_stock") matchesStock = stock > 0 && stock <= 5;
      if (stockFilter === "out_of_stock") matchesStock = stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Handle inline stock change
  const handleStockInputChange = (productId: string, val: string) => {
    const num = parseInt(val) || 0;
    setEditingStocks((prev) => ({
      ...prev,
      [productId]: num < 0 ? 0 : num,
    }));
  };

  const handleStockIncrement = (product: Product, delta: number) => {
    const currentVal = editingStocks[product.id] ?? (product.stock || 0);
    const newVal = Math.max(0, currentVal + delta);
    setEditingStocks((prev) => ({
      ...prev,
      [product.id]: newVal,
    }));
  };

  const handleSaveStock = async (product: Product) => {
    const newStock = editingStocks[product.id];
    if (newStock === undefined || newStock === product.stock) return;

    setSavingId(product.id);
    try {
      await updateDoc(doc(db, "products", product.id), {
        stock: newStock,
        status: newStock === 0 ? "inactive" : "active",
        updatedAt: Timestamp.now(),
      });
      triggerToast(`Stock updated for "${product.name}" to ${newStock} units.`);
      setEditingStocks((prev) => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
    } catch (err) {
      console.error("Failed to update stock:", err);
      alert("Failed to update stock in Firestore.");
    } finally {
      setSavingId(null);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          <HiOutlineXCircle className="w-4 h-4 text-rose-500" />
          Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-500" />
          Low Stock ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
        Healthy ({stock})
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans">
        <div className="relative bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl border border-white/20 dark:border-[#2A2A2A]/60 rounded-3xl p-16 text-center shadow-2xl shadow-black/5">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-base font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
            Synchronizing Store Inventory...
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

      {/* ===== 1. HEADER SECTION ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0D0D0D] border border-white/30 dark:border-[#2A2A2A]/50 shadow-2xl shadow-black/5 p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">
              <span>Portal</span>
              <HiOutlineChevronRight className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-900 dark:text-white font-extrabold">Inventory</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              Inventory <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              Track warehouse stock levels, monitor low stock alerts, and perform real-time inventory adjustments.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/products/add"
              className="flex items-center gap-2.5 px-7 py-4 bg-gradient-to-r from-zinc-900 to-black dark:from-white dark:to-zinc-200 text-white dark:text-black rounded-2xl text-sm font-extrabold uppercase tracking-wider hover:opacity-90 transition shadow-xl cursor-pointer"
            >
              <HiOutlinePlus className="w-5 h-5 stroke-[2.5]" />
              <span>Add New Item</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== 2. 4 CORE SUMMARY STAT CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Valuation */}
        <motion.div
          whileHover={{ y: -6 }}
          className="relative group bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Total Stock Value</span>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
              <HiOutlineBanknotes className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl lg:text-4xl font-black text-amber-500 dark:text-amber-400 font-mono mt-3">
            Rs. {metrics.totalValue.toLocaleString()}
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estimated Catalog Valuation</p>
        </motion.div>

        {/* Total Stock Units */}
        <motion.div
          whileHover={{ y: -6 }}
          className="relative group bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Total Stock Units</span>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg">
              <FaBoxes className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white font-mono mt-3">
            <AnimatedCounter value={metrics.totalUnits} />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Across {metrics.totalProducts} Catalog Items</p>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          whileHover={{ y: -6 }}
          className="relative group bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Low Stock Warning</span>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg">
              <HiOutlineExclamationTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl lg:text-5xl font-black text-amber-500 dark:text-amber-400 font-mono mt-3">
            <AnimatedCounter value={metrics.lowStockCount} />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Products with ≤ 5 Units</p>
        </motion.div>

        {/* Out of Stock */}
        <motion.div
          whileHover={{ y: -6 }}
          className="relative group bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase tracking-widest text-zinc-400">Out of Stock</span>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-lg">
              <HiOutlineXCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl lg:text-5xl font-black text-rose-500 dark:text-rose-400 font-mono mt-3">
            <AnimatedCounter value={metrics.outOfStockCount} />
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Immediate Reorder Required</p>
        </motion.div>
      </div>

      {/* ===== 3. SEARCH & FILTERS RIBBON ===== */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Search Box */}
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search inventory by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl text-base font-bold text-zinc-900 dark:text-white outline-none transition-all shadow-inner"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">Healthy Stock (&gt;5)</option>
              <option value="low_stock">Low Stock (1-5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="mens">Men's Wear</option>
              <option value="fightwear">Fight Wear</option>
              <option value="sportswear">Sports Wear</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== 4. INVENTORY TABLE ===== */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-zinc-50/80 to-zinc-100/80 dark:from-[#1A1A1A]/80 dark:to-[#0D0D0D]/80 border-b border-zinc-200/60 dark:border-zinc-800/60 text-sm font-black text-zinc-400 uppercase tracking-[0.15em]">
                <th className="px-6 py-5">Product Item</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Stock Status</th>
                <th className="px-6 py-5">Inline Stock Quantity</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/60 dark:divide-zinc-800/40 text-base font-semibold">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const currentStock = product.stock || 0;
                  const editedStock = editingStocks[product.id];
                  const hasEdited = editedStock !== undefined && editedStock !== currentStock;
                  const displayStock = editedStock !== undefined ? editedStock : currentStock;

                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.images?.[0] || product.colorImages?.[0]?.url || "/placeholder.png"}
                            alt={product.name}
                            className="w-14 h-16 rounded-xl object-cover border border-zinc-200/80 dark:border-zinc-700/50"
                          />
                          <div>
                            <p className="font-extrabold text-lg text-zinc-900 dark:text-white line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {product.id.slice(0, 10)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-5">
                        <span className="text-sm font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800/80 px-3.5 py-1.5 rounded-full border border-white/20 dark:border-zinc-700/50">
                          {product.category || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-5">
                        <span className="font-black text-zinc-900 dark:text-white font-mono text-lg">
                          Rs. {product.price?.toLocaleString()}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-5">
                        {getStockBadge(displayStock)}
                      </td>

                      {/* Inline Stock Controls */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStockIncrement(product, -1)}
                            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center font-extrabold transition cursor-pointer"
                          >
                            <HiOutlineMinus className="w-4 h-4" />
                          </button>

                          <input
                            type="number"
                            value={displayStock}
                            onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                            className={`w-20 py-2 text-center font-mono font-black text-base rounded-xl border outline-none transition ${hasEdited
                              ? "bg-amber-50 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-zinc-100/70 dark:bg-[#1A1A1A]/70 text-zinc-900 dark:text-white border-transparent"
                              }`}
                          />

                          <button
                            type="button"
                            onClick={() => handleStockIncrement(product, 1)}
                            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center font-extrabold transition cursor-pointer"
                          >
                            <HiOutlinePlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Save Action */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {hasEdited && (
                            <button
                              onClick={() => handleSaveStock(product)}
                              disabled={savingId === product.id}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-emerald-600 transition shadow-md cursor-pointer disabled:opacity-50"
                            >
                              {savingId === product.id ? (
                                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <HiOutlineCheck className="w-4 h-4" />
                              )}
                              <span>Save</span>
                            </button>
                          )}

                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="p-2.5 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-2xl hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition cursor-pointer border border-white/20 dark:border-zinc-700/50 shadow-sm"
                            title="Edit Product Details"
                          >
                            <HiOutlinePencilSquare className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-zinc-400">
                    <HiOutlineCube className="w-14 h-14 mx-auto text-zinc-400 mb-3" />
                    <p className="text-lg font-extrabold text-zinc-900 dark:text-white">No Inventory Items Found</p>
                    <p className="text-sm">Try clearing search or filter parameters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
