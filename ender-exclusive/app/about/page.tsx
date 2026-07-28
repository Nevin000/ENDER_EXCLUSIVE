"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Flame, Target, Compass, Award, CheckCircle2 } from "lucide-react";
import { FiArrowRight } from "react-icons/fi";

export default function AboutPage() {
  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300">
      
      {/* ===== 1. HERO SECTION (Premium Gray Theme) ===== */}
      <section className="relative bg-zinc-100 dark:bg-[#121212] text-zinc-900 dark:text-white py-16 sm:py-24 lg:py-28 border-b border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        {/* Subtle Ambient Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Small Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            <span>ABOUT ENDER</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight"
          >
            About <span className="text-amber-500">ENDER</span>
          </motion.h1>

          {/* Supporting Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider"
          >
            Redefining Modern Men's Fashion
          </motion.h2>

          {/* Hero Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-zinc-600 dark:text-zinc-300 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto font-medium leading-relaxed"
          >
            ENDER is a proudly Sri Lankan men's fashion brand that brings together streetwear, activewear, and combat sports apparel under one bold identity. What began as a passion for designing custom Muay Thai shorts has grown into a modern lifestyle brand dedicated to creating clothing that inspires confidence, movement, and individuality. Every collection is thoughtfully crafted with premium materials, combining style, comfort, and functionality to support every aspect of an active lifestyle. Whether you're training in the gym, competing in the ring, or expressing your personal style in everyday life, ENDER creates apparel that empowers you to stand out with confidence and authenticity.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-amber-500 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black font-extrabold text-sm uppercase tracking-wider rounded-full transition-all duration-300 shadow-md hover:scale-105"
            >
              <span>Explore Collection</span>
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 font-extrabold text-sm uppercase tracking-wider rounded-full transition-all duration-300"
            >
              <span>Contact Us</span>
            </Link>
          </motion.div>
        </div>
      </section>


      {/* ===== 2. OUR PHILOSOPHY SECTION ===== */}
      <section className="py-16 sm:py-24 lg:py-28 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Narrative Box */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>OUR PHILOSOPHY</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
                Designed for Confidence. <br />
                <span className="text-amber-500">Built for Movement.</span>
              </h2>

              <div className="space-y-4 text-zinc-600 dark:text-zinc-300 text-base sm:text-lg font-medium leading-relaxed">
                <p className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  At ENDER, we believe clothing is more than just fashion—it's an extension of your identity. Every design is created with the purpose of helping individuals express themselves with confidence while enjoying the perfect balance of comfort, performance, and style.
                </p>

                <p>
                  Inspired by movement, discipline, and modern living, our collections are designed for those who refuse to settle for ordinary.
                </p>

                <p className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-zinc-900 dark:text-white font-extrabold text-base sm:text-lg">
                  Whether you're pursuing fitness goals, embracing an active lifestyle, or simply looking for clothing that reflects your personality, ENDER is committed to delivering apparel that supports every step of your journey.
                </p>
              </div>
            </motion.div>

            {/* Right Editorial Image Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative h-[550px] sm:h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 group"
            >
              <img
                src="/images/about/about_philosophy_fashion.png"
                alt="Ender Exclusive Philosophy"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 inset-x-0 p-8 sm:p-12 text-white">
                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-black mb-3 inline-block">
                  Brand Philosophy
                </span>
                <h3 className="text-3xl sm:text-4xl font-black uppercase">Confidence & Comfort</h3>
                <p className="mt-2 text-zinc-300 text-sm sm:text-base font-medium max-w-md">
                  Created for those who refuse to settle for ordinary.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ===== 3. OUR STORY SECTION ===== */}
      <section className="py-16 sm:py-24 lg:py-28 bg-zinc-50 dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4"
            >
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>OUR STORY</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight"
            >
              From the Ring to <span className="text-amber-500">Everyday Life</span>
            </motion.h2>
          </div>

          {/* Story Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Story Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative h-[500px] sm:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <img
                src="/images/about/about_story_muay_thai.png"
                alt="Ender Origin Muay Thai Story"
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
              <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md text-amber-400 font-mono font-bold text-xs border border-white/10">
                ESTABLISHED 2023 • THE SHED MARTIAL ARTS
              </div>
            </motion.div>

            {/* Story Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-5 text-zinc-600 dark:text-zinc-300 text-base sm:text-lg font-medium leading-relaxed"
            >
              <p className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <strong>ENDER was founded in 2023</strong> with a simple yet meaningful vision: to design custom Muay Thai shorts for the athletes of <strong>The Shed Martial Arts Institute</strong> competing in the Sri Lankan National Muay Thai Championship. Every pair of shorts was carefully crafted to reflect the identity, dedication, and determination of the athlete wearing them. More than performance apparel, they represented confidence, discipline, resilience, and the courage to compete with purpose.
              </p>

              <p>
                As our journey evolved, so did our vision. What began as a combat sports apparel initiative has grown into a contemporary men's fashion brand offering premium streetwear, activewear, and combat sports clothing.
              </p>

              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-zinc-900 dark:text-white font-bold">
                While our collections have expanded beyond the ring, the values that shaped our very first designs continue to define who we are today. Every product is created with a commitment to quality, authenticity, functionality, and timeless design, ensuring that every customer experiences clothing that not only looks exceptional but also reflects confidence, strength, and individuality.
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ===== 4. CORE VALUES PILLARS ===== */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
              Our Core <span className="text-amber-500">Values</span>
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg font-medium">
              The foundational principles guiding every Ender Exclusive garment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-md hover:border-amber-500/50 transition">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-2">Quality</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                Premium materials and uncompromised craftsmanship in every stitch.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-md hover:border-amber-500/50 transition">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-2">Authenticity</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                True to our martial arts roots and dedicated to genuine self-expression.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-md hover:border-amber-500/50 transition">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-2">Functionality</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                Combining comfort, performance, and movement for everyday living.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-md hover:border-amber-500/50 transition">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-2">Timeless Design</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                Bold silhouettes designed to look exceptional and stand out with confidence.
              </p>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-16 p-10 sm:p-14 rounded-3xl bg-black text-white text-center border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 className="text-3xl sm:text-5xl font-black uppercase">Wear Confidence. Stand Out.</h3>
              <p className="text-zinc-400 text-base sm:text-lg">
                Explore our full collection of streetwear, activewear, and combat sports clothing.
              </p>
              <div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-full transition duration-200 shadow-xl hover:scale-105"
                >
                  <span>Shop Collection</span>
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
