"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Sparkles, AlertCircle, Quote, ShoppingBag } from "lucide-react";
import { getLookbookCollectionBySlug } from "@/services/lookbookService";
import { getProducts } from "@/services/productService";
import { getLookbookProductStyle } from "@/services/manualLookbookService";
import { LookBookCollection, LookBookProductStyle } from "@/types/lookbook";
import { Product } from "@/types/product";

// Animation Variants
const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as const } },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as const },
  },
};

export default function LookBookStylingPage({
  params,
}: {
  params: Promise<{ collectionSlug: string; productSlug: string }>;
}) {
  const resolvedParams = use(params);
  const { collectionSlug, productSlug } = resolvedParams;

  const [collection, setCollection] = useState<LookBookCollection | null>(null);
  const [mainProduct, setMainProduct] = useState<Product | null>(null);
  const [styleData, setStyleData] = useState<LookBookProductStyle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [col, products] = await Promise.all([
          getLookbookCollectionBySlug(collectionSlug),
          getProducts(),
        ]);

        setCollection(col);

        if (col && products) {
          // Match main product by checking both slug and id
          const matchedProduct = products.find(
            (p) => p.slug === productSlug || p.id === productSlug
          );
          setMainProduct(matchedProduct || null);

          // If found, fetch manual styling details
          if (matchedProduct) {
            const manualStyle = await getLookbookProductStyle(matchedProduct.id);
            if (manualStyle && manualStyle.matchingItems) {
              manualStyle.matchingItems.sort((a, b) => a.displayOrder - b.displayOrder);
            }
            setStyleData(manualStyle);
          }
        }
      } catch (err) {
        console.error("Error loading styling page:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [collectionSlug, productSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-3 border-black dark:border-amber-400 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
          Curating Editorial Story...
        </p>
      </div>
    );
  }

  if (!mainProduct) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white flex flex-col items-center justify-center py-32 px-6 text-center space-y-6">
        <AlertCircle className="w-14 h-14 text-zinc-400 dark:text-zinc-600 mb-2" />
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Item Not Found</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md text-sm font-light leading-relaxed">
          We couldn't locate this piece in the editorial lookbook collection.
        </p>
        <Link
          href={`/featured-looks/lookbook/${collectionSlug}`}
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-amber-400 font-black text-xs uppercase tracking-widest rounded-full transition shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Collection
        </Link>
      </div>
    );
  }

  const mainImg =
    mainProduct.images?.[0] ||
    mainProduct.colorImages?.[0]?.url ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000";

  const matchingItems = styleData?.matchingItems || [];
  const editorialNotes =
    styleData?.styleNotes ||
    `Designed with a minimalist aesthetic and refined silhouette, this piece offers effortless versatility. Pair it with complementary tonal layers and tailored accessories to achieve a modern, high-fashion statement look.`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white transition-colors duration-300 pb-36">
      {/* Editorial Navigation Top Bar */}
      <div className="bg-zinc-50/80 dark:bg-[#111111]/80 border-b border-zinc-200/80 dark:border-[#1F1F1F]">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href={`/featured-looks/lookbook/${collectionSlug}`}
            className="group flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-amber-400 transition"
          >
            <motion.div whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 400 }}>
              <ArrowLeft className="w-4 h-4 text-amber-500" />
            </motion.div>
            <span>Back to {collection?.title || "Collection"}</span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>FASHION EDITORIAL</span>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-16 space-y-24 sm:space-y-32">
        {/* ===== HERO STYLED PRODUCT SECTION ===== */}
        <section className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* LEFT: Large Hero Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] as const }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-zinc-100 dark:bg-[#111111] shadow-2xl border border-zinc-200/80 dark:border-[#2A2A2A] group">
              <Image
                src={mainImg}
                alt={mainProduct.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-106 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Category Pill Overlay */}
              <div className="absolute top-6 left-6 z-10">
                <span className="px-4 py-1.5 bg-black/70 backdrop-blur-md text-amber-400 border border-amber-400/30 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                  {mainProduct.category || "Editorial Piece"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Product Headline & Description */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] as const }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                HERO FEATURED LOOK
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-[0.95]">
                {mainProduct.name}
              </h1>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg font-light leading-relaxed tracking-wide">
              {mainProduct.description ||
                "An iconic wardrobe centerpiece defined by premium craftsmanship, immaculate tailoring, and effortless luxury style."}
            </p>

            {/* Shop Product Quick Link */}
            {mainProduct.slug && (
              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={`/shop/${mainProduct.slug}`}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white dark:bg-amber-400 dark:text-black font-black text-xs uppercase tracking-[0.2em] rounded-full shadow-xl transition-all hover:bg-zinc-800 dark:hover:bg-amber-300"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shop This Item</span>
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </section>

        {/* ===== "COMPLETE THE LOOK" SECTION ===== */}
        <section className="space-y-12 border-t border-zinc-200 dark:border-[#2A2A2A] pt-20">
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-3 max-w-3xl"
          >
            <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
              EDITORIAL PAIRINGS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Complete The Look
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base font-light leading-relaxed">
              Curated matching pieces and style pairings designed to complement the {mainProduct.name}.
            </p>
          </motion.div>

          {matchingItems.length === 0 ? (
            <motion.div
              variants={fadeInVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="py-20 text-center bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-[#2A2A2A] rounded-[2.5rem] p-8"
            >
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light italic">
                Matching ensemble recommendations for this item are currently being curated by our styling directors.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {matchingItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={cardItemVariants}
                  whileHover={{ y: -8 }}
                  className="group relative flex flex-col bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-[2.5rem] overflow-hidden shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-2xl transition-all duration-500 hover:border-zinc-400 dark:hover:border-zinc-700"
                >
                  {/* Large Image with Hover Zoom */}
                  <div className="relative aspect-[4/5] bg-zinc-100 dark:bg-[#1A1A1A] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />
                  </div>

                  {/* Item Content */}
                  <div className="p-7 flex flex-col justify-between flex-1 space-y-3">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-light text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* ===== "STYLE NOTES" SECTION ===== */}
        <section className="border-t border-zinc-200 dark:border-[#2A2A2A] pt-20">
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="relative bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-[#2A2A2A] rounded-[2.5rem] p-8 sm:p-14 overflow-hidden shadow-sm dark:shadow-2xl"
          >
            {/* Ambient Background Accent Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 space-y-6 max-w-4xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Quote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                    ADMINISTRATOR DIRECTIVE
                  </h3>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                    Style Notes
                  </h2>
                </div>
              </div>

              <p className="text-zinc-700 dark:text-zinc-200 text-base sm:text-xl font-serif italic leading-relaxed">
                "{editorialNotes}"
              </p>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-mono tracking-widest uppercase">
                <span>ENDER EXCLUSIVE EDITORIAL TEAM</span>
                <span>CURATED STYLING</span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
