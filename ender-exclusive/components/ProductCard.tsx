"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Flame, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();

  const [addedMsg, setAddedMsg] = useState(false);

  const mainImage =
    (product.images && product.images[0]) ||
    "/lookbook/look_book_banner.avif";

  const isFavorited = isInWishlist(product.id);
  const finalPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;

  const detailUrl = product.isOnSale ? `/on-sale/${product.id}` : `/shop/${product.id}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    addItem({
      userId: user.uid,
      productId: product.id,
      name: product.name,
      image: mainImage,
      price: finalPrice,
      color: "Standard",
      size: "M",
      quantity: 1,
      stock: product.stock ?? 50,
      deliveryCharge: product.deliveryCharge ?? 350,
    });

    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      productId: product.id,
      name: product.name,
      image: mainImage,
      price: product.price,
      salePrice: product.salePrice,
      isOnSale: product.isOnSale,
      category: product.category,
    });
  };

  return (
    <div className="group relative bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between">
      
      {/* CARD TOP IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] bg-zinc-100 dark:bg-[#141414] overflow-hidden">
        <Link href={detailUrl} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* SALE BADGE */}
        {product.isOnSale && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white font-black text-[11px] uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1 z-10">
            <Flame className="w-3 h-3 fill-white" />
            <span>SALE</span>
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
          <Heart className={`w-5 h-5 transition-transform duration-200 active:scale-125 ${isFavorited ? "fill-white text-white" : ""}`} />
        </button>

        {/* HOVER OVERLAY BUTTONS */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={handleQuickAdd}
            className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-amber-400 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {addedMsg ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>ADDED!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO CART</span>
              </>
            )}
          </button>

          <Link
            href={detailUrl}
            className="p-3 bg-white/90 dark:bg-black/90 text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-black rounded-2xl shadow-xl transition flex items-center justify-center"
            title="View Details"
          >
            <Eye className="w-4.5 h-4.5" />
          </Link>
        </div>
      </div>

      {/* CARD BOTTOM INFO CONTAINER */}
      <div className="p-5 space-y-2">
        {product.category && (
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
            {product.category}
          </span>
        )}

        <Link href={detailUrl} className="block">
          <h3 className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* PRICING ROW */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-red-600 dark:text-red-500">
              Rs. {finalPrice.toLocaleString()}
            </span>

            {product.isOnSale && product.price && (
              <span className="text-xs text-zinc-400 line-through font-semibold">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold uppercase text-zinc-400">
            In Stock
          </span>
        </div>
      </div>

    </div>
  );
}
