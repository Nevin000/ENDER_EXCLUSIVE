"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Headset, Truck, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function WhyChooseUs() {
  const pillars = [
    {
      title: "Battle-Tested Durability",
      description:
        "Reinforced triple-stitching, 480GSM heavyweight cotton, and 4-way stretch compression engineered for high-intensity training.",
      badge: "Pro Combat Standard",
      icon: ShieldCheck,
      badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      iconStyle: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    },
    {
      title: "24/7 WhatsApp Ordering",
      description:
        "Instant sizing assistance, live stock availability, and direct WhatsApp ordering with our dedicated customer support team.",
      badge: "Instant Support",
      icon: FaWhatsapp,
      badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      iconStyle: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    },
    {
      title: "Express Fast Delivery",
      description:
        "Fast, reliable islandwide Sri Lanka shipping & worldwide express dispatch directly to your doorstep with live tracking.",
      badge: "Islandwide & Global",
      icon: Truck,
      badgeStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      iconStyle: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    },
    {
      title: "14-Day Easy Size Exchange",
      description:
        "Guaranteed 100% satisfaction with a hassle-free 14-day exchange policy so you get the perfect fit every single time.",
      badge: "Guaranteed Fit",
      icon: RefreshCw,
      badgeStyle: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      iconStyle: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    },
  ];

  return (
    <section className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white py-16 sm:py-20 lg:py-24 transition-colors duration-300">
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE ENDER EXCLUSIVE ADVANTAGE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase text-zinc-900 dark:text-white"
          >
            Why Choose <span className="text-amber-500">Ender Exclusive</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg font-medium leading-relaxed"
          >
            We combine high-performance combat technology, heavyweight fabrics, and cutting-edge streetwear aesthetics engineered without compromise.
          </motion.p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                className="group relative"
              >
                <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/90 group-hover:border-amber-500/50 shadow-lg group-hover:shadow-xl transition-all duration-500 flex flex-col justify-between h-full">
                  <div>
                    {/* Icon & Badge */}
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className={`p-3.5 rounded-2xl border ${pillar.iconStyle} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${pillar.badgeStyle}`}>
                        {pillar.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                      {pillar.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Checked Guarantee */}
                  <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs font-black text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Verified Brand Standard</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
