"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, ArrowRight, ShieldCheck, Truck, Flame, Layers, Search, Swords, Heart } from "lucide-react";
import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";

export default function FightwearPage() {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        const fightProducts = data.filter(
          (product) => product.status === "active" && product.category === "fightwear"
        );
        setProducts(fightProducts);
      } catch (error) {
        console.error("Error fetching fightwear products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300 pb-32">
      
      {/* ===== HERO BANNER SECTION ===== */}
      <section className="relative bg-[#070707] text-white py-20 sm:py-28 lg:py-36 border-b border-zinc-800/80 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/shop/fightwear_hero_bg.png"
            alt="Ender Fightwear Hero Banner"
            className="w-full h-full object-cover object-center filter brightness-85 contrast-105 scale-105"
          />
        </div>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-black/30 to-black/60 z-10" />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-3xl pointer-events-none z-10" />

        <div className="relative z-20 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-md text-red-500 text-xs font-black uppercase tracking-[0.3em]"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>PRO COMBAT & FIGHTWEAR</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white"
          >
            Pro <span className="text-red-600">Fightwear</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-2xl sm:text-3xl font-extrabold uppercase text-amber-400 tracking-wider"
          >
            Muay Thai Shorts • Boxing Gloves • Training Rashguards
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-zinc-300 text-base sm:text-lg font-medium leading-relaxed"
          >
            Engineered for fighters, combat sports athletes, and ring champions. Constructed with ultra-durable reinforced satin, tear-resistant spandex, and ergonomic mobility cutouts.
          </motion.p>
        </div>
      </section>

      {/* ===== BENEFITS HIGHLIGHT BAR ===== */}
      <div className="bg-zinc-50 dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800 py-6">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center sm:justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Combat Grade Durability</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Reinforced stitching & high-impact satin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Islandwide Dispatch</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Fast delivery across all Sri Lanka locations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Fighter Tested</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">100% Genuine Ender Pro Fight Equipment</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CATALOG & SEARCH ===== */}
      <main className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
              COMBAT CATALOG
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Pro Fightwear ({filteredProducts.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search Fightwear gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-28 text-center space-y-4 text-zinc-400">
            <div className="w-12 h-12 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-red-500">
              Loading Fightwear Gear...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center space-y-6 max-w-lg mx-auto bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm"
          >
            <div className="p-4 rounded-full bg-red-500/10 text-red-500 w-fit mx-auto">
              <Swords className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tight">No Items Found</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                No fightwear equipment found matching your search.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const mainImg =
                product.images?.[0] ||
                product.colorImages?.[0]?.url ||
                "/lookbook/look_book_banner.avif";
              
              const isOutOfStock = product.stock <= 0;
              const targetSlug = product.slug || product.id;
              const productLink = product.isOnSale ? `/on-sale/${targetSlug}` : `/shop/${targetSlug}`;
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
                  isOnSale: product.isOnSale,
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
                  <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-[#1A1A1A] overflow-hidden block">
                    <Link href={productLink} className="block w-full h-full">
                      <Image
                        src={mainImg}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-95 contrast-105"
                      />
                    </Link>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                      <span className="px-3 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full border border-white/10 shadow-md">
                        PRO FIGHTWEAR
                      </span>
                      {product.isOnSale && (
                        <span className="px-3.5 py-1 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-white" />
                          SALE
                        </span>
                      )}
                    </div>

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

                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div>
                      <Link href={productLink}>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-1 leading-tight">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description || "Pro combat gear crafted for fight training and championship competition."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-2xl font-black text-zinc-900 dark:text-red-500">
                          Rs. {(product.salePrice || product.price)?.toLocaleString()}
                        </span>
                        {product.isOnSale && product.price && product.salePrice && (
                          <span className="text-sm font-semibold text-zinc-400 line-through">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Link
                        href={productLink}
                        className={`w-full py-3.5 font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 group/btn ${
                          product.isOnSale
                            ? "bg-red-600 hover:bg-red-500 text-white"
                            : "bg-black dark:bg-white text-white dark:text-black hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white"
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{product.isOnSale ? "View Sale Deal" : "View Product Details"}</span>
                      </Link>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </main>

    </main>
  );
}
