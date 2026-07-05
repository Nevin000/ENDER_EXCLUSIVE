"use client";

import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export default function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center bg-white overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-8 lg:px-12 w-full">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="uppercase tracking-[0.45em] text-gray-500 text-sm mb-6">
              Ender Exclusive
            </p>

            <h1 className="text-6xl md:text-7xl xl:text-8xl font-black leading-[0.95]">
              ELEVATE
              <br />
              YOUR
              <br />
              STYLE
            </h1>

            <p className="mt-8 text-gray-600 text-lg max-w-xl leading-relaxed">
              Premium Streetwear, Fightwear and Sportswear designed for
              athletes, fighters and modern lifestyles.
            </p>

            <div className="flex flex-wrap gap-5 mt-10">
              <button
                className="
                  bg-black
                  text-white
                  px-8
                  py-4
                  rounded-full
                  flex
                  items-center
                  gap-3
                  hover:scale-105
                  transition-all
                  duration-300
                "
              >
                Shop Now
                <FiArrowRight />
              </button>

              <button
                className="
                  border-2
                  border-black
                  px-8
                  py-4
                  rounded-full
                  hover:bg-black
                  hover:text-white
                  transition-all
                  duration-300
                "
              >
                Explore Collection
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-14">
              <div>
                <h3 className="text-3xl font-bold">500+</h3>
                <p className="text-gray-500">Products</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">10K+</h3>
                <p className="text-gray-500">Customers</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">99%</h3>
                <p className="text-gray-500">Satisfaction</p>
              </div>
            </div>
          </motion.div>

          {/* Right Banner */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div
              className="
                h-[450px]
                md:h-[650px]
                xl:h-[750px]
                rounded-[40px]
                bg-gradient-to-br
                from-black
                via-gray-900
                to-gray-700
                overflow-hidden
                shadow-[0_25px_80px_rgba(0,0,0,0.25)]
              "
            >
              {/* Placeholder Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/70 text-xl tracking-widest">
                  FASHION BANNER
                </span>
              </div>
            </div>

            {/* Floating Badge */}
            <div
              className="
                absolute
                bottom-8
                left-8
                bg-white
                rounded-2xl
                px-6
                py-4
                shadow-xl
              "
            >
              <p className="text-sm text-gray-500">New Collection</p>

              <h4 className="font-bold text-lg">Summer 2026</h4>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
