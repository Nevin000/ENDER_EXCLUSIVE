"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, ExternalLink, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [cartSuccessMsg, setCartSuccessMsg] = useState("");

  const handleAddToCart = (item: any) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const finalPrice = item.isOnSale && item.salePrice ? item.salePrice : item.price;

    addItem({
      userId: user.uid,
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: finalPrice,
      color: "Standard",
      size: "M",
      quantity: 1,
      stock: 50,
      deliveryCharge: 350,
    });

    setCartSuccessMsg(`Added ${item.name} to cart!`);
    setTimeout(() => setCartSuccessMsg(""), 3500);
  };

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300 pb-32">
      
      {/* ===== HERO HEADER ===== */}
      <section className="relative bg-[#070707] text-white py-16 sm:py-24 border-b border-zinc-800/80 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-[0.25em]">
              <Heart className="w-3.5 h-3.5 fill-red-400" />
              <span>SAVED SELECTIONS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
              My <span className="text-red-500">Wishlist</span> ({wishlist.length})
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base font-medium max-w-xl">
              Save your favorite Ender Exclusive streetwear, fightwear, and sportswear items to order whenever you're ready.
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="px-6 py-3.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white font-black text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Clear All Saved Items
            </button>
          )}
        </div>
      </section>

      {/* ===== BREADCRUMB BAR ===== */}
      <div className="bg-zinc-50 dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800 py-3.5">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-bold">My Wishlist</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-8">
        
        {cartSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black uppercase tracking-wider flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{cartSuccessMsg}</span>
          </motion.div>
        )}

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center space-y-6 max-w-lg mx-auto bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm"
          >
            <div className="p-4 rounded-full bg-red-600/10 text-red-500 w-fit mx-auto">
              <Heart className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black uppercase tracking-tight">Your Wishlist is Empty</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Click the heart icon on any product across our shop to save your favorite gear here.
              </p>
            </div>
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest rounded-full transition shadow-xl hover:scale-105"
              >
                <span>Explore Shop Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlist.map((item) => {
                const finalPrice = item.isOnSale && item.salePrice ? item.salePrice : item.price;
                const itemDetailUrl = item.isOnSale ? `/on-sale/${item.productId}` : `/shop/${item.productId}`;

                return (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-5 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-red-500/40 transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[4/5] bg-white dark:bg-[#141414] rounded-2xl overflow-hidden">
                        <Link href={itemDetailUrl} className="block w-full h-full">
                          <img
                            src={item.image || "/lookbook/look_book_banner.avif"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        
                        <button
                          onClick={() => removeFromWishlist(item.productId)}
                          className="absolute top-3 right-3 p-2.5 rounded-full bg-red-600 text-white shadow-md hover:scale-110 transition cursor-pointer"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        {item.category && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                            {item.category}
                          </span>
                        )}
                        <Link href={itemDetailUrl} className="block">
                          <h4 className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white truncate hover:text-amber-500 transition">
                            {item.name}
                          </h4>
                        </Link>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-sm font-black text-red-600 dark:text-red-500">
                            Rs. {finalPrice.toLocaleString()}
                          </span>
                          {item.isOnSale && item.price && (
                            <span className="text-xs text-zinc-400 line-through">
                              Rs. {item.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 py-3 rounded-2xl bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-amber-300 transition cursor-pointer shadow-md"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add To Cart</span>
                      </button>

                      <Link
                        href={itemDetailUrl}
                        className="p-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>

    </main>
  );
}
