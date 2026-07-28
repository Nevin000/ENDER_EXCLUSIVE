"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, ArrowRight, ShieldCheck, Truck, Flame, Layers, Search, Filter } from "lucide-react";
import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        const activeProducts = data.filter((product) => product.status === "active");
        setProducts(activeProducts);
      } catch (error) {
        console.error("Error fetching shop products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const categories = [
    { id: "all", name: "All Products", count: products.length },
    { id: "mens", name: "Men's Wear", count: products.filter((p) => p.category === "mens").length },
    { id: "fightwear", name: "Fight Wear", count: products.filter((p) => p.category === "fightwear").length },
    { id: "sportswear", name: "Sports Wear", count: products.filter((p) => p.category === "sportswear").length },
  ];

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300 pb-32">
      
      {/* ===== 1. HERO BANNER SECTION (High-Resolution Shop Background Image) ===== */}
      <section className="relative bg-[#070707] text-white py-20 sm:py-28 lg:py-36 border-b border-zinc-800/80 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/shop/shop_hero_bg.png"
            alt="Ender Shop Flagship Banner Background"
            className="w-full h-full object-cover object-center filter brightness-85 contrast-105 scale-105"
          />
        </div>

        {/* Cinematic Gradient & Ambient Glow Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-black/30 to-black/60 z-10" />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-10" />

        <div className="relative z-20 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-400 text-xs font-black uppercase tracking-[0.3em]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <span>ENDER EXCLUSIVE FLAGSHIP STORE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white"
          >
            Shop <span className="text-amber-400">All Collections</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-2xl sm:text-3xl font-extrabold uppercase text-amber-400 tracking-wider"
          >
           Men's wear • Pro Fightwear • Athletic Sportswear
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-zinc-300 text-base sm:text-lg font-medium leading-relaxed"
          >
            Explore our complete collection of heavyweight hoodies, graphic tees, pro combat fightwear, and athletic activewear. Crafted for performance, durability, and modern luxury.
          </motion.p>
        </div>
      </section>

      {/* ===== 2. BENEFITS HIGHLIGHT BAR ===== */}
      <div className="bg-zinc-50 dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800 py-6">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center sm:justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Heavyweight Quality</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Combed premium cotton & custom fits</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Islandwide Shipping</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Fast delivery across all Sri Lanka locations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Authentic Ender Gear</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">100% Genuine product guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 3. CATEGORY FILTERS & SEARCH CONTROL ===== */}
      <main className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-12">
        
        {/* Search & Category Filter Header Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
              STORE CATALOG
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              All Products ({filteredProducts.length})
            </h2>
          </div>

          {/* Search Input & Category Pills */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "text-black bg-amber-400 shadow-md"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <span>{cat.name} ({cat.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-28 text-center space-y-4 text-zinc-400">
            <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-amber-500">
              Loading Store Products...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center space-y-6 max-w-lg mx-auto bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm"
          >
            <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 w-fit mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tight">No Products Found</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Try searching for another keyword or reset the category filter.
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest rounded-full transition shadow-xl hover:scale-105 cursor-pointer"
              >
                <span>Reset Filters</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="mt-16 p-10 sm:p-14 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h3 className="text-3xl sm:text-4xl font-black uppercase">Looking For Limited Time Sales?</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium max-w-xl mx-auto">
              Explore our red hot flash sale deals and save up to 50% off select streetwear and activewear.
            </p>
            <div>
              <Link
                href="/on-sale"
                className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-xl hover:scale-105"
              >
                <span>View On Sale Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

    </main>
  );
}
