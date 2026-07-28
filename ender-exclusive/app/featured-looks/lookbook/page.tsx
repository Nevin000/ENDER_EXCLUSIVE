"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Sparkles, ArrowRight, Compass, Layers, ShieldCheck, Flame } from "lucide-react";
import { getLookbookCollections } from "@/services/lookbookService";
import { LookBookCollection } from "@/types/lookbook";

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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as const },
  },
};

// Default Fallback Editorial Collections for Instant Wow Factor
const defaultCollections = [
  {
    id: "def-1",
    slug: "streetwear-2026",
    title: "2026 Streetwear Editorial",
    gender: "Men's",
    description: "Heavyweight 480GSM cotton hoodies, relaxed graphic tees, and luxury urban silhouettes built for everyday confidence.",
    coverImage: "/lookbook/look_book_banner.avif",
    styledLooksCount: 12,
  },
  {
    id: "def-2",
    slug: "pro-fightwear",
    title: "Pro Fightwear Edition",
    gender: "Unisex",
    description: "Authentic custom Muay Thai shorts & combat sports gear tested by elite fighters in Sri Lanka and worldwide.",
    coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
    styledLooksCount: 8,
  },
  {
    id: "def-3",
    slug: "athletic-performance",
    title: "Athletic Performance Line",
    gender: "Unisex",
    description: "Breathable 4-way stretch activewear engineered for high-intensity training, sparring, and modern movement.",
    coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
    styledLooksCount: 10,
  },
];

export default function CustomerLookBookPage() {
  const [collections, setCollections] = useState<LookBookCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGender, setActiveGender] = useState("all");

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const data = await getLookbookCollections({ status: "published" });
        setCollections(data);
      } catch (error) {
        console.error("Error loading lookbook collections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const filteredCollections = collections.filter((c) => {
    const matchesGender =
      activeGender === "all" ||
      c.gender === activeGender ||
      c.gender === "all" ||
      c.gender === "unisex";
    return matchesGender;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300 pb-32">

      {/* ===== 1. HERO SECTION (With High-Resolution Editorial Background Image) ===== */}
      <section className="relative bg-[#070707] text-white py-20 sm:py-28 lg:py-32 border-b border-zinc-800/80 overflow-hidden">
        {/* Background Image (Brighter & Clearer) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/lookbook/lookbook_hero_bg.png"
            alt="Look Book Hero Background"
            className="w-full h-full object-cover object-center filter brightness-85 contrast-105 scale-105"
          />
        </div>

        {/* Cinematic Gradient Overlays (Reduced Darkness) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-black/25 to-black/40 z-10" />
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-10" />

        <div className="relative z-20 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-400 text-xs font-black uppercase tracking-[0.3em]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <span>EDITORIAL LOOK BOOK 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white"
          >
            Editorial <span className="text-amber-400">Look Book</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-2xl sm:text-3xl font-extrabold uppercase text-amber-400 tracking-wider"
          >
            Curated Streetwear, Fightwear & Athletic Fashion
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-zinc-300 text-base sm:text-lg font-medium leading-relaxed"
          >
            Explore high-fashion collection stories, expertly styled outfits, and bespoke ensemble recommendations crafted for ENDER EXCLUSIVE.
          </motion.p>
        </div>
      </section>

      {/* ===== 2. EDITORIAL FILTER BAR ===== */}
      <div className="bg-zinc-50 dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800 py-5">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2 p-1.5 bg-zinc-200/80 dark:bg-[#18181B] border border-zinc-300 dark:border-zinc-700/80 rounded-2xl w-full md:w-auto overflow-x-auto">
            {[
              { label: "All Collections", value: "all" },
              { label: "Men's", value: "men" },
              { label: "Women's", value: "women" },
              { label: "Unisex", value: "unisex" },
            ].map((tab) => {
              const isActive = activeGender === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveGender(tab.value)}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${isActive
                    ? "text-white dark:text-black font-extrabold"
                    : "text-zinc-700 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeGenderIndicator"
                      className="absolute inset-0 bg-black dark:bg-amber-400 rounded-xl shadow-md"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== 3. COLLECTIONS GALLERY GRID ===== */}
      <main className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {loading ? (
          <div className="py-28 text-center space-y-4 text-zinc-400">
            <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">
              Loading Editorial Collections...
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          >
            {(filteredCollections.length > 0 ? filteredCollections : defaultCollections).map((col: any) => {
              const cover =
                col.coverImage ||
                "/lookbook/look_book_banner.avif";
              const styledLooksCount = col.styledLooksCount || col.productIds?.length || 8;
              const linkHref = col.slug ? `/featured-looks/lookbook/${col.slug}` : "/shop";

              return (
                <motion.div
                  key={col.id || col.title}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="group relative flex flex-col bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-amber-500/50"
                >
                  {/* Large Cover Image with Hover Zoom */}
                  <Link
                    href={linkHref}
                    className="relative aspect-[4/5] bg-zinc-100 dark:bg-[#1A1A1A] overflow-hidden block"
                  >
                    <Image
                      src={cover}
                      alt={col.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-95 contrast-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500" />

                    {/* Top Badges */}
                    <div className="absolute top-5 left-5 flex gap-2 z-10">
                      <span className="px-3.5 py-1 bg-black/80 backdrop-blur-md text-amber-400 font-bold text-xs uppercase rounded-full tracking-wider border border-white/10 shadow-lg">
                        {col.gender || "UNISEX"}
                      </span>
                    </div>

                    {/* Styled Looks Counter Badge */}
                    <div className="absolute top-5 right-5 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        {styledLooksCount} {styledLooksCount === 1 ? "Styled Look" : "Styled Looks"}
                      </span>
                    </div>

                    {/* Collection Title Overlay */}
                    <div className="absolute bottom-6 left-7 right-7 text-white space-y-1.5 z-10">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                        COLLECTION EDITORIAL
                      </span>
                      <h3 className="text-3xl font-black tracking-tight text-white uppercase leading-tight group-hover:text-amber-400 transition-colors duration-300">
                        {col.title}
                      </h3>
                    </div>
                  </Link>

                  {/* Card Content & Action Button */}
                  <div className="p-7 flex flex-col justify-between flex-1 space-y-6">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                      {col.description ||
                        "Curated luxury styling guides and manual ensemble recommendations for your elevated wardrobe."}
                    </p>

                    <Link
                      href={linkHref}
                      className="group/btn relative overflow-hidden inline-flex items-center justify-between w-full pt-4 border-t border-zinc-200 dark:border-zinc-800 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        Explore Collection
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
