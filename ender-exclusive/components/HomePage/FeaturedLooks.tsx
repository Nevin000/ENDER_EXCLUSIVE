"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Sparkles, Layers, ShieldCheck } from "lucide-react";

export default function FeaturedLooks() {
  const looks = [
    {
      title: "Fighters Collection",
      subtitle:
        "Pro combat fightwear engineered for champions. Tested by elite fighters in boxing, MMA, and Muay Thai.",
      tag: "Pro Fighter Edition",
      badge: "★ Official Fightwear",
      link: "/featured-looks/fighters",
      image: "/images/featured-looks/fighters_collection_card.png",
      icon: ShieldCheck,
      badgeStyle: "bg-amber-400 text-black font-black",
    },
    {
      title: "Seasonal Lookbook",
      subtitle:
        "Explore our high-end fashion editorials, curated street styles, heavyweight hoodies, and modern athletic silhouettes.",
      tag: "2026 Editorial",
      badge: "★ Exclusive Look Book",
      link: "/featured-looks/lookbook",
      image: "/lookbook/look_book_banner.avif",
      icon: Layers,
      badgeStyle: "bg-black dark:bg-white text-white dark:text-black font-black",
    },
  ];

  return (
    <section className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white py-16 sm:py-20 lg:py-24 border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-300">
      {/* Container matching Navbar margin & padding */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Centered) */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            <span>EDITORIAL & AMBASSADORS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase"
          >
            Featured <span className="text-amber-500">Looks</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg font-medium"
          >
            Discover exclusive fighter collections and editorial lookbooks curated for champions.
          </motion.p>
        </div>

        {/* Lookbook Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
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
                  <div className="relative h-[560px] sm:h-[620px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group-hover:border-amber-500/50 shadow-xl group-hover:shadow-2xl transition-all duration-500 bg-black">
                    {/* Card Background Image */}
                    <img
                      src={look.image}
                      alt={look.title}
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 filter brightness-90 contrast-105"
                    />

                    {/* Gradient Overlays for Text Legibility */}
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

                      <h3 className="text-4xl sm:text-5xl font-black text-white group-hover:text-amber-400 transition-colors duration-300">
                        {look.title}
                      </h3>

                      <p className="mt-3 text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
                        {look.subtitle}
                      </p>

                      <div className="mt-8">
                        <span className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black font-black text-sm uppercase tracking-wider rounded-full group-hover:bg-amber-400 group-hover:text-black transition-all duration-300 shadow-xl">
                          <span>Explore Collection</span>
                          <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
  );
}
