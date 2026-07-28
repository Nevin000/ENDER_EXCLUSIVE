"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Trophy,
  Play,
  Video,
  Image as ImageIcon,
  Grid,
} from "lucide-react";
import { getFighterImages } from "@/services/fighterService";
import { FighterImage } from "@/types/fighter";

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as const },
  },
};

export default function CustomerFightersGalleryPage() {
  const [allMedia, setAllMedia] = useState<FighterImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "image" | "video">("all");

  // Lightbox Modal state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Mobile Touch Swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const data = await getFighterImages({ status: "published" });
        setAllMedia(data);
      } catch (err) {
        console.error("Error loading fighters gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Filter items based on active tab
  const displayedMedia = allMedia.filter((item) => {
    if (activeTab === "image") return item.mediaType !== "video";
    if (activeTab === "video") return item.mediaType === "video";
    return true;
  });

  const photosCount = allMedia.filter((item) => item.mediaType !== "video").length;
  const videosCount = allMedia.filter((item) => item.mediaType === "video").length;

  // Lightbox Keyboard Navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null || displayedMedia.length === 0) return;

      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % displayedMedia.length : null));
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + displayedMedia.length) % displayedMedia.length : null
        );
      }
    },
    [lightboxIndex, displayedMedia]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null || lightboxIndex === null)
      return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft) {
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % displayedMedia.length : null));
    } else if (isSwipeRight) {
      setLightboxIndex((prev) =>
        prev !== null ? (prev - 1 + displayedMedia.length) % displayedMedia.length : null
      );
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white transition-colors duration-300 pb-36 font-sans">
      {/* ===== HERO SECTION (With High-Resolution Editorial Background Image) ===== */}
      <section className="relative bg-[#070707] text-white py-20 sm:py-28 lg:py-32 border-b border-zinc-800/80 overflow-hidden">
        {/* Background Image (Brighter & Clearer - Matching Look Book Style) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/fighters/fighters_hero_bg_v2.png"
            alt="Fighters Showcase Hero Background"
            className="w-full h-full object-cover object-center filter brightness-85 contrast-105 scale-105"
          />
        </div>

        {/* Cinematic Gradient Overlays */}
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
            <span>FIGHTERS SHOWCASE GALLERY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white"
          >
            Fighters <span className="text-amber-400">Showcase</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-2xl sm:text-3xl font-extrabold uppercase text-amber-400 tracking-wider"
          >
            Pro Combat Gear & Official Ambassadors
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-zinc-300 text-base sm:text-lg font-medium leading-relaxed"
          >
            The visual editorial showcase highlighting high-definition photos and video highlights of athletes, fighters, and ambassadors worldwide.
          </motion.p>
        </div>
      </section>

      {/* ===== FILTER TABS BAR ===== */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          {/* Media Count Badge */}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <span>SHOWCASE MEDIA</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 font-extrabold text-[11px]">
              {allMedia.length} ITEMS
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex bg-zinc-100 dark:bg-[#121212] p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setLightboxIndex(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <Grid className="w-4 h-4" />
              All Media ({allMedia.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("image");
                setLightboxIndex(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTab === "image"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photos ({photosCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("video");
                setLightboxIndex(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTab === "video"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <Video className="w-4 h-4 text-amber-500" />
              Videos ({videosCount})
            </button>
          </div>
        </div>
      </div>

      {/* ===== MEDIA GRID GALLERY ===== */}
      <main className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
        {loading ? (
          <div className="py-32 text-center space-y-4 text-zinc-400">
            <div className="w-12 h-12 border-3 border-black dark:border-amber-400 border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">
              Loading High-Res Showcase...
            </p>
          </div>
        ) : displayedMedia.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-28 text-center space-y-5 max-w-md mx-auto bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-[#2A2A2A] rounded-3xl p-10"
          >
            <Trophy className="w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              No {activeTab === "video" ? "Videos" : activeTab === "image" ? "Photos" : "Showcase Media"} Found
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
              Check back soon for new high-resolution athletic editorial showcases.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {displayedMedia.map((item, index) => {
              const isVideo = item.mediaType === "video";

              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-200/80 dark:border-[#2A2A2A] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:border-amber-400/80 dark:hover:border-amber-500/80"
                >
                  {isVideo ? (
                    <div className="relative w-full h-full bg-black">
                      <video
                        src={item.imageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                      />
                      {/* Video Tag Badge */}
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/20 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-wider">
                        <Video className="w-3.5 h-3.5" />
                        <span>VIDEO</span>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={item.imageUrl}
                      alt={`Fighters gallery media ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-1000 ease-out"
                    />
                  )}

                  {/* Hover overlay with play/zoom icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="p-4 bg-white/90 dark:bg-black/90 text-black dark:text-white rounded-full shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
                      {isVideo ? (
                        <Play className="w-6 h-6 text-amber-500 fill-amber-500 ml-0.5" />
                      ) : (
                        <Maximize2 className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* ===== FULLSCREEN LIGHTBOX MODAL (VIDEO & PHOTO) ===== */}
      <AnimatePresence>
        {lightboxIndex !== null && displayedMedia[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8"
          >
            {/* Top Lightbox Bar */}
            <div className="flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
              <div className="text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>FIGHTERS SHOWCASE</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-amber-400 font-mono font-bold text-xs">
                  {displayedMedia[lightboxIndex].mediaType === "video" ? "VIDEO" : "PHOTO"}
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {lightboxIndex + 1} / {displayedMedia.length}
                </span>
              </div>

              <button
                onClick={() => setLightboxIndex(null)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition backdrop-blur-md cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Media View & Navigation Controls */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <button
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + displayedMedia.length) % displayedMedia.length
                  )
                }
                className="absolute left-2 sm:left-6 z-20 p-4 bg-white/10 hover:bg-amber-400 hover:text-black text-white rounded-full backdrop-blur-md transition shadow-2xl cursor-pointer"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center"
              >
                {displayedMedia[lightboxIndex].mediaType === "video" ? (
                  <video
                    src={displayedMedia[lightboxIndex].imageUrl}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl border border-white/10"
                  />
                ) : (
                  <Image
                    src={displayedMedia[lightboxIndex].imageUrl}
                    alt={`Fighters showcase photo ${lightboxIndex + 1}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain"
                  />
                )}
              </motion.div>

              <button
                onClick={() => setLightboxIndex((lightboxIndex + 1) % displayedMedia.length)}
                className="absolute right-2 sm:right-6 z-20 p-4 bg-white/10 hover:bg-amber-400 hover:text-black text-white rounded-full backdrop-blur-md transition shadow-2xl cursor-pointer"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Thumbnails Navigation Strip */}
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 z-10 max-w-7xl mx-auto w-full scrollbar-none">
              {displayedMedia.map((thumb, idx) => {
                const isThumbVideo = thumb.mediaType === "video";
                return (
                  <button
                    key={`thumb-${thumb.id}`}
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      lightboxIndex === idx
                        ? "border-amber-400 scale-110 shadow-lg"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    {isThumbVideo ? (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <video
                          src={thumb.imageUrl}
                          muted
                          preload="metadata"
                          className="w-full h-full object-cover opacity-70"
                        />
                        <Play className="absolute w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                    ) : (
                      <Image src={thumb.imageUrl} alt="Thumbnail" fill className="object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
