"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import { Sparkles } from "lucide-react";

export default function Hero() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative h-[90vh] min-h-[620px] max-h-[1080px] w-full flex items-center justify-start overflow-hidden bg-black text-white">
      {/* ===== FULL-WIDTH BACKGROUND HERO VIDEO ===== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop"
          className="w-full h-full object-cover scale-105 filter brightness-[0.85] contrast-105 transition-transform duration-1000"
        >
          <source src="/Videos/Hero_video.mp4" type="video/mp4" />
          <source src="/videos/Hero_video.mp4" type="video/mp4" />
          <source
            src="https://cdn.pixabay.com/video/2021/04/12/70857-536417758_large.mp4"
            type="video/mp4"
          />
        </video>

        {/* ===== SUBTLE CINEMATIC DARK GRADIENT OVERLAY ===== */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/70 z-10" />
      </div>

      {/* ===== HERO CONTENT CONTAINER (VERTICALLY CENTERED & LEFT ALIGNED) ===== */}
      <div className="relative z-20 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl space-y-6 md:space-y-8 text-left">
          
          {/* 1. Small Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-black tracking-[0.35em] uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ENDER EXCLUSIVE</span>
          </motion.div>

          {/* 2. Large Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-5xl sm:text-7xl md:text-8xl xl:text-9xl font-black tracking-tight leading-[0.92] text-white uppercase"
          >
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Style.
            </span>
          </motion.h1>

          {/* 3. Short Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-zinc-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl"
          >
            Premium streetwear, fightwear and sportswear crafted for modern athletes and everyday confidence.
          </motion.p>

          {/* 4. Buttons (Primary & Secondary) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2"
          >
            {/* Primary Button */}
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 bg-white text-black font-extrabold text-base sm:text-lg rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <span>Shop Collection</span>
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            {/* Secondary Button */}
            <Link
              href="/featured-looks/lookbook"
              className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-9 py-4 bg-black/40 hover:bg-white/10 text-white font-bold text-base sm:text-lg rounded-full border border-white/30 hover:border-white/60 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <span>Explore Look Book</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ===== ANIMATED BOUNCING SCROLL DOWN INDICATOR ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        onClick={scrollToContent}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white transition-colors duration-200 group"
      >
        <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-[0.25em] text-zinc-400 group-hover:text-white transition-colors">
          Scroll Down
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition"
        >
          <FiChevronDown className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>
    </section>
  );
}
