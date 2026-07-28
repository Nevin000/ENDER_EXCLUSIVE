"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Flame, ShieldCheck, Truck, Clock, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";

export default function OnSalePage() {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        const filteredProducts = data.filter(
          (product) => product.isOnSale === true && product.status === "active"
        );
        setSaleProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching sale products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300 pb-28">

      {/* ===== 1. HERO SECTION (With High-Resolution Red Sale Background Image) ===== */}
      <section className="relative bg-[#070707] text-white py-20 sm:py-28 lg:py-32 border-b border-zinc-800/80 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/on-sale/sale_hero_bg.png"
            alt="On Sale Flash Banner Background"
            className="w-full h-full object-cover object-center filter brightness-85 contrast-105 scale-105"
          />
        </div>

        {/* Cinematic Red & Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-black/30 to-black/60 z-10" />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/20 rounded-full blur-3xl pointer-events-none z-10" />

        <div className="relative z-20 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-md"
          >
            <Flame className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" />
            <span>FLASH SALE & EXCLUSIVE DEALS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white"
          >
            On <span className="text-red-500">Sale</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-2xl sm:text-3xl font-extrabold uppercase text-red-500 tracking-wider"
          >
            Limited Time Discounts • Up to 10% OFF
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-zinc-300 text-base sm:text-lg font-medium leading-relaxed"
          >
            Explore our discounted streetwear, fightwear, and activewear collections. Premium materials engineered for movement, performance, and confidence at limited-time special prices.
          </motion.p>
        </div>
      </section>

      {/* ===== 2. ULTRA-MODERN BENEFITS HIGHLIGHT BAR ===== */}
      <div className="bg-zinc-50/80 dark:bg-[#101010] border-b border-zinc-200 dark:border-zinc-800/80 py-8 backdrop-blur-md">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Limited Stock */}
          <motion.div
            whileHover={{ y: -3 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-red-500/50 transition-all duration-300 group"
          >
            <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">
                Limited Stock
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-0.5">
                Hurry! Deals available while stocks last
              </p>
            </div>
          </motion.div>

          {/* Card 2: Islandwide Dispatch */}
          <motion.div
            whileHover={{ y: -3 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-red-500/50 transition-all duration-300 group"
          >
            <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">
                Islandwide Dispatch
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-0.5">
                Fast delivery across all Sri Lanka locations
              </p>
            </div>
          </motion.div>

          {/* Card 3: Authentic Quality */}
          <motion.div
            whileHover={{ y: -3 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-red-500/50 transition-all duration-300 group"
          >
            <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">
                Authentic Quality
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-0.5">
                100% Genuine Ender Exclusive products
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ===== 3. RED SALE PRODUCTS GRID SECTION ===== */}
      <main className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {loading ? (
          <div className="py-28 text-center space-y-4 text-zinc-400">
            <div className="w-12 h-12 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-red-500">
              Unveiling Flash Sale Deals...
            </p>
          </div>
        ) : saleProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center space-y-6 max-w-lg mx-auto bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm"
          >
            <div className="p-4 rounded-full bg-red-500/10 text-red-500 w-fit mx-auto">
              <Flame className="w-10 h-10 fill-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tight">No Items On Sale Right Now</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Our flash sale events update regularly. Explore our full collection of premium streetwear and activewear.
              </p>
            </div>
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-full transition shadow-xl hover:scale-105"
              >
                <span>Browse All Shop Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">

            {/* Header Title Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
                  RED HOT DISCOUNTS
                </span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                  Featured Sale Products ({saleProducts.length})
                </h2>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {saleProducts.map((product) => {
                const mainImg =
                  product.images?.[0] ||
                  product.colorImages?.[0]?.url ||
                  "/lookbook/look_book_banner.avif";

                const discountPercent =
                  product.price && product.salePrice && product.price > product.salePrice
                    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                    : 0;

                const targetId = product.id;
                const isFavorited = isInWishlist(product.id);

                const handleWishlistToggle = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();

                  toggleWishlist({
                    productId: product.id,
                    name: product.name,
                    image: mainImg,
                    price: product.price,
                    salePrice: product.salePrice,
                    isOnSale: true,
                    category: product.category,
                  });
                };

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ y: -6 }}
                    className="group relative flex flex-col bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:border-red-500/50"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-[#1A1A1A] overflow-hidden block">
                      <Link href={`/on-sale/${targetId}`} className="block w-full h-full">
                        <Image
                          src={mainImg}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-95 contrast-105"
                        />
                      </Link>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

                      {/* Red Discount Badge Top Left */}
                      {discountPercent > 0 && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-3.5 py-1.5 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 fill-white" />
                            -{discountPercent}% OFF
                          </span>
                        </div>
                      )}

                      {/* WISHLIST HEART ICON BUTTON */}
                      <button
                        onClick={handleWishlistToggle}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-20 cursor-pointer ${
                          isFavorited
                            ? "bg-red-600 text-white scale-110 shadow-red-600/40"
                            : "bg-white/90 dark:bg-black/80 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-black hover:scale-110"
                        }`}
                        title={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-5 h-5 transition-transform duration-200 active:scale-125 ${
                            isFavorited ? "fill-white text-white" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                      <div>
                        {product.category && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 mb-1 block">
                            {product.category}
                          </span>
                        )}
                        <Link href={`/on-sale/${targetId}`}>
                          <h3 className="text-xl font-black text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-1 leading-tight">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {product.description || "Premium activewear centerpiece crafted for performance and everyday style."}
                        </p>
                      </div>

                      {/* Interactive Color Option Swatches */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Colors:
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(product.colors && product.colors.length > 0
                            ? product.colors
                            : ["Black", "Red", "Gold", "White"]
                          ).slice(0, 4).map((colorItem: string, idx: number) => {
                            const colorMap: Record<string, string> = {
                              black: "#000000",
                              red: "#EF4444",
                              gold: "#F59E0B",
                              white: "#FFFFFF",
                              olive: "#65A30D",
                              navy: "#1E3A8A",
                              gray: "#6B7280",
                            };
                            const bgStyle =
                              colorMap[colorItem.toLowerCase()] || colorItem;

                            return (
                              <div
                                key={idx}
                                title={colorItem}
                                className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-sm transition-transform duration-200 hover:scale-125 cursor-pointer"
                                style={{ backgroundColor: bgStyle }}
                              />
                            );
                          })}
                          {(product.colors?.length || 4) > 4 && (
                            <span className="text-[10px] font-bold text-zinc-400">
                              +{(product.colors?.length || 4) - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing Display */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="text-2xl font-black text-red-600 dark:text-red-500">
                            Rs. {(product.salePrice || product.price)?.toLocaleString()}
                          </span>
                          {product.price && product.salePrice && product.price > product.salePrice && (
                            <span className="text-sm font-semibold text-zinc-400 line-through">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div>
                        <Link
                          href={`/on-sale/${targetId}`}
                          className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 group/btn"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>View Product Details</span>
                        </Link>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Red CTA Banner */}
            <div className="mt-16 p-10 sm:p-14 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 text-center shadow-lg">
              <h3 className="text-3xl font-black uppercase mb-3">Looking For More Signature Styles?</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium max-w-xl mx-auto mb-6">
                Discover our latest streetwear collections, heavyweight hoodies, and customized Muay Thai fightwear.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-xl hover:scale-105"
              >
                <span>Browse Full Store Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        )}
      </main>

    </main>
  );
}
