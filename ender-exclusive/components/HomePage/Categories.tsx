"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Flame, Shirt, Dumbbell, Sparkles } from "lucide-react";

export default function Categories() {
  const categories = [
    {
      title: "Men's Wear",
      subtitle: "Heavyweight Hoodies, Oversized Tees & Streetwear",
      badge: "Streetwear Collection",
      itemCount: "48+ Items",
      link: "/shop/mens",
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop",
      icon: Shirt,
      color: "from-[#0A0A0A]/90 via-black/50 to-transparent",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      title: "Fight Wear",
      subtitle: "Pro Boxing Gloves, Rashguards & Combat Gear",
      badge: "Pro Combat Gear",
      itemCount: "35+ Items",
      link: "/shop/fightwear",
      image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1200&auto=format&fit=crop",
      icon: Flame,
      color: "from-[#0A0A0A]/90 via-black/50 to-transparent",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      title: "Sports Wear",
      subtitle: "Athletic Performance Apparel & Gym Tops",
      badge: "Performance Gear",
      itemCount: "42+ Items",
      link: "/shop/sportswear",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
      icon: Dumbbell,
      color: "from-[#0A0A0A]/90 via-black/50 to-transparent",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
  ];

  return (
    <section className="bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white py-16 sm:py-20 lg:py-24 border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-300">
      {/* Container matching Navbar margin & padding */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>COLLECTION OVERVIEW</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase text-zinc-900 dark:text-white"
          >
            Shop By <span className="text-amber-500">Category</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg font-medium"
          >
            Discover premium collections crafted for athletes, fighters and modern streetwear lifestyles.
          </motion.p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className="group relative"
              >
                <Link href={category.link} className="block">
                  <div className="relative h-[560px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group-hover:border-amber-500/50 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    {/* Background Image */}
                    <img
                      src={category.image}
                      alt={category.title}
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-95 contrast-105"
                    />

                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-85 group-hover:opacity-90 transition-opacity duration-500`}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

                    {/* Top Badges */}
                    <div className="absolute top-6 left-6 z-10">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md border ${category.badgeColor}`}
                      >
                        {category.badge}
                      </span>
                    </div>

                    {/* Bottom Content Container */}
                    <div className="absolute bottom-0 inset-x-0 p-8 sm:p-10 z-10 flex flex-col justify-end">
                      <div className="flex items-center gap-3 mb-3 text-amber-400">
                        <div className="p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-amber-400">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-300">
                          Ender Exclusive
                        </span>
                      </div>

                      <h3 className="text-3xl sm:text-4xl font-black text-white group-hover:text-amber-400 transition-colors duration-300">
                        {category.title}
                      </h3>

                      <p className="mt-2 text-zinc-300 text-sm sm:text-base font-medium line-clamp-2">
                        {category.subtitle}
                      </p>

                      <div className="mt-6 flex items-center gap-3">
                        <span className="px-6 py-3 bg-white text-black font-extrabold text-sm rounded-full group-hover:bg-amber-400 group-hover:text-black transition-all duration-300 flex items-center gap-2 shadow-lg">
                          Explore Category
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
