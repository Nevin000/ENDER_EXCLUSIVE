"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Layers, Award, Flame } from "lucide-react";
import { FiArrowRight } from "react-icons/fi";

export default function FeaturedLooksPage() {
  const looks = [
    {
      title: "Fighters Collection",
      subtitle:
        "Pro combat fightwear engineered for champions. Tested in the ring by elite fighters in boxing, MMA, and Muay Thai.",
      tag: "NATIONAL CHAMPIONSHIP GEAR",
      badge: "★ PRO FIGHTER EDITION",
      link: "/featured-looks/fighters",
      image: "/images/featured-looks/fighters_collection_card.png",
      icon: ShieldCheck,
      badgeStyle: "bg-amber-400 text-black font-black",
    },
    {
      title: "Seasonal Look Book",
      subtitle:
        "Explore our high-end fashion editorials, curated street styles, heavyweight hoodies, and modern athletic silhouettes.",
      tag: "EDITORIAL 2026",
      badge: "★ EXCLUSIVE LOOK BOOK",
      link: "/featured-looks/lookbook",
      image: "/lookbook/look_book_banner.avif",
      icon: Layers,
      badgeStyle: "bg-white text-black font-black",
    },
  ];

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300">
      
      {/* ===== HERO SECTION (With High-Resolution Background Image) ===== */}
      <section className="relative bg-[#070707] text-white py-20 sm:py-28 lg:py-32 border-b border-zinc-800/80 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/featured-looks/featured_looks_hero_bg.png"
            alt="Featured Looks Hero Background"
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
            <span>FEATURED EDITORIALS & LOOKBOOKS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white"
          >
            Featured <span className="text-amber-400">Looks</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-2xl sm:text-3xl font-extrabold uppercase text-amber-400 tracking-wider"
          >
            Fighter Ambassadors & Seasonal Styles
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-zinc-300 text-base sm:text-lg font-medium leading-relaxed"
          >
            Explore our pro fightwear collections, athlete endorsements, and high-fashion editorial lookbooks curated for champions.
          </motion.p>
        </div>
      </section>


      {/* ===== FEATURED LOOKS GRID SECTION ===== */}
      <section className="py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {looks.map((look, index) => {
              const IconComponent = look.icon;
              return (
                <motion.div
                  key={look.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.15 }}
                  className="group relative"
                >
                  <Link href={look.link} className="block">
                    <div className="relative h-[600px] sm:h-[680px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group-hover:border-amber-500/60 shadow-2xl transition-all duration-500 bg-black">
                      {/* Background Image */}
                      <img
                        src={look.image}
                        alt={look.title}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 filter brightness-90 contrast-105"
                      />

                      {/* Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

                      {/* Top Badges */}
                      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                        <span className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-md ${look.badgeStyle}`}>
                          {look.badge}
                        </span>
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-black/70 backdrop-blur-md text-zinc-200 border border-white/20">
                          {look.tag}
                        </span>
                      </div>

                      {/* Bottom Content Container */}
                      <div className="absolute bottom-0 inset-x-0 p-8 sm:p-12 z-10 flex flex-col justify-end text-white">
                        <div className="flex items-center gap-3 mb-3 text-amber-400">
                          <IconComponent className="w-5 h-5" />
                          <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-300">
                            Ender Exclusive Editorial
                          </span>
                        </div>

                        <h2 className="text-4xl sm:text-6xl font-black text-white group-hover:text-amber-400 transition-colors duration-300">
                          {look.title}
                        </h2>

                        <p className="mt-3 text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
                          {look.subtitle}
                        </p>

                        <div className="mt-8">
                          <span className="inline-flex items-center gap-3 px-9 py-4 bg-white text-black font-black text-sm uppercase tracking-wider rounded-full group-hover:bg-amber-400 group-hover:text-black transition-all duration-300 shadow-xl hover:scale-105">
                            <span>Explore Collection</span>
                            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ===== EDITORIAL HIGHLIGHTS BAR ===== */}
      <section className="py-16 bg-zinc-50 dark:bg-[#0A0A0A]">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            
            <div className="p-8 rounded-3xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-black uppercase mb-1">Tested By Champions</h3>
              <p className="text-sm text-zinc-500 font-medium">Pro combat fightwear engineered for intense competition in the ring.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Flame className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-black uppercase mb-1">Custom Muay Thai Gear</h3>
              <p className="text-sm text-zinc-500 font-medium">Handcrafted customized fightwear for Sri Lanka's finest athletes.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Award className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-black uppercase mb-1">Luxury Street Aesthetics</h3>
              <p className="text-sm text-zinc-500 font-medium">Heavyweight 480GSM cottons & oversized athletic silhouettes.</p>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
