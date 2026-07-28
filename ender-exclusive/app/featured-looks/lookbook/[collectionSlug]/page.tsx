"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Layers, Shirt } from "lucide-react";
import { getLookbookCollectionBySlug } from "@/services/lookbookService";
import { getProducts } from "@/services/productService";
import { LookBookCollection } from "@/types/lookbook";
import { Product } from "@/types/product";

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as const },
  },
};

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const resolvedParams = use(params);
  const collectionSlug = resolvedParams.collectionSlug;

  const [collectionData, setCollectionData] = useState<LookBookCollection | null>(null);
  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      setLoading(true);
      try {
        const col = await getLookbookCollectionBySlug(collectionSlug);
        setCollectionData(col);

        if (col && col.productIds && col.productIds.length > 0) {
          const allProducts = await getProducts();
          const assigned = allProducts.filter((p) => col.productIds.includes(p.id));
          setAssignedProducts(assigned);
        }
      } catch (err) {
        console.error("Error loading collection products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCollection();
  }, [collectionSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070707] text-zinc-900 dark:text-white flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Unveiling Collection Story...
        </p>
      </div>
    );
  }

  if (!collectionData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070707] text-zinc-900 dark:text-white flex flex-col items-center justify-center py-32 px-6 text-center space-y-6">
        <div className="p-6 bg-zinc-100 dark:bg-[#161616] border border-zinc-200 dark:border-[#2A2A2A] rounded-full text-zinc-400">
          <Layers className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          Collection Not Found
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md text-sm font-light leading-relaxed">
          The requested Look Book collection story does not exist or has been removed from our editorial catalog.
        </p>
        <Link
          href="/featured-looks/lookbook"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-black dark:bg-amber-400 text-white dark:text-black hover:bg-amber-500 font-black text-xs uppercase tracking-widest rounded-full transition shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Look Book
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300 pb-32">
      
      {/* ===== 1. TOP BACK NAVIGATION BAR (Navbar Aligned Margin & Padding) ===== */}
      <div className="bg-zinc-50 dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/featured-looks/lookbook"
            className="group flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-amber-400 transition"
          >
            <motion.div whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 400 }}>
              <ArrowLeft className="w-4 h-4 text-amber-500" />
            </motion.div>
            <span>All Look Book Collections</span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>COLLECTION EDITORIAL</span>
          </div>
        </div>
      </div>

      {/* ===== 2. HERO COLLECTION BANNER ===== */}
      <section className="relative h-[60vh] min-h-[460px] max-h-[680px] bg-black text-white overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <Image
          src={
            collectionData.coverImage ||
            "/lookbook/look_book_banner.avif"
          }
          alt={collectionData.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70 filter brightness-90 contrast-105 scale-102 transition-transform duration-1000"
        />

        {/* Multi-stage High-Contrast Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

        <div className="absolute inset-0 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end py-12 sm:py-16 z-10">
          {/* Banner Editorial Details */}
          <div className="space-y-5 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <span className="px-4 py-1.5 bg-amber-400 text-black text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                {collectionData.gender || "UNISEX"}
              </span>
              <span className="px-4 py-1.5 bg-black/70 backdrop-blur-md text-zinc-200 border border-white/20 text-xs font-bold uppercase tracking-widest rounded-full">
                {assignedProducts.length} Styled Pieces
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-7xl font-black tracking-tight text-white uppercase leading-[0.95]"
            >
              {collectionData.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-zinc-200 text-base sm:text-xl font-light leading-relaxed max-w-2xl tracking-wide"
            >
              {collectionData.description ||
                "Discover bespoke styling inspiration, statement pairing guides, and complete editorial looks."}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ===== 3. PRODUCTS GRID SECTION (Navbar Aligned Margin & Padding) ===== */}
      <main className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Section Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              CURATED STYLED LOOKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-zinc-900 dark:text-white">
              Featured Products ({assignedProducts.length})
            </h2>
          </div>
        </div>

        {assignedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center space-y-4 bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10"
          >
            <Shirt className="w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-600" />
            <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white">No Products Styled Yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-light">
              Styling recommendations for this collection are currently being curated by our editorial team.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          >
            {assignedProducts.map((product) => {
              const mainImg =
                product.images?.[0] ||
                product.colorImages?.[0]?.url ||
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800";
              const targetSlug = product.slug || product.id;

              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col bg-white dark:bg-[#111111] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-500 hover:border-amber-500/50"
                >
                  {/* Product Image with Zoom Effect */}
                  <Link
                    href={`/featured-looks/lookbook/${collectionSlug}/${targetSlug}`}
                    className="relative aspect-[3/4] bg-zinc-100 dark:bg-[#1A1A1A] overflow-hidden block"
                  >
                    <Image
                      src={mainImg}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-95 contrast-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category Tag */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3.5 py-1 bg-black/80 backdrop-blur-md text-amber-400 text-xs font-black uppercase tracking-wider rounded-full border border-white/10 shadow-md">
                        {product.category || "Apparel"}
                      </span>
                    </div>
                  </Link>

                  {/* Body Details */}
                  <div className="p-7 flex flex-col justify-between flex-1 space-y-5">
                    <div>
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {product.description || "Premium styling centerpiece curated for high fashion pairing."}
                      </p>
                    </div>

                    <Link
                      href={`/featured-looks/lookbook/${collectionSlug}/${targetSlug}`}
                      className="group/btn inline-flex items-center justify-between w-full pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 transition"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        View Style
                      </span>
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#1F1F1F] group-hover/btn:bg-amber-400 group-hover/btn:text-black flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
