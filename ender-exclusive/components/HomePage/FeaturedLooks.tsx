"use client";

import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export default function FeaturedLooks() {
  const looks = [
    {
      title: "Fighters Collection",
      subtitle:
        "Premium fightwear engineered for champions who demand performance and style.",
      tag: "Elite Performance",
    },
    {
      title: "Look Book",
      subtitle:
        "Explore our seasonal editorials, curated outfits and modern fashion inspiration.",
      tag: "Fashion Editorial",
    },
  ];

  return (
    <section className="max-w-[1700px] mx-auto px-8 lg:px-12 py-32">
      {/* Header */}
      <div className="text-center mb-20">
        <p className="uppercase tracking-[0.5em] text-gray-500 text-sm mb-4">
          Ender Exclusive
        </p>

        <h2 className="text-5xl md:text-6xl font-black mb-6">Featured Looks</h2>

        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Discover exclusive collections, editorial looks and premium
          inspirations curated by Ender Exclusive.
        </p>
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-2 gap-10">
        {looks.map((look, index) => (
          <motion.div
            key={look.title}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: index * 0.15,
            }}
            className="group"
          >
            <div
              className="
                relative
                h-[650px]
                overflow-hidden
                rounded-[40px]
                cursor-pointer
                shadow-xl
              "
            >
              {/* Background */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-black
                  via-gray-900
                  to-gray-700
                  group-hover:scale-110
                  transition-all
                  duration-1000
                "
              />

              {/* Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-black/25
                  group-hover:bg-black/45
                  transition-all
                  duration-500
                "
              />

              {/* Top Badge */}
              <div
                className="
                  absolute
                  top-8
                  left-8
                  z-20
                  bg-white/10
                  backdrop-blur-md
                  border
                  border-white/20
                  text-white
                  px-5
                  py-2
                  rounded-full
                  text-sm
                "
              >
                {look.tag}
              </div>

              {/* Content */}
              <div
                className="
                  relative
                  z-10
                  h-full
                  flex
                  flex-col
                  justify-end
                  p-12
                "
              >
                <p className="uppercase tracking-[0.4em] text-gray-300 text-sm mb-4">
                  Ender Exclusive
                </p>

                <h3 className="text-5xl xl:text-6xl font-black text-white mb-5 leading-tight">
                  {look.title}
                </h3>

                <p className="text-gray-300 text-lg max-w-lg mb-10 leading-relaxed">
                  {look.subtitle}
                </p>

                <button
                  className="
                    w-fit
                    bg-white
                    text-black
                    px-8
                    py-4
                    rounded-full
                    flex
                    items-center
                    gap-3
                    font-semibold
                    hover:bg-black
                    hover:text-white
                    transition-all
                    duration-300
                  "
                >
                  Explore Collection
                  <FiArrowRight
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-2
                    "
                  />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-20">
        <p className="uppercase tracking-[0.4em] text-gray-500 text-sm mb-4">
          Explore More
        </p>

        <h3 className="text-4xl font-bold mb-6">
          Designed For Every Lifestyle
        </h3>

        <p className="text-gray-600 max-w-2xl mx-auto">
          Whether you're training, competing or expressing your personal style,
          Ender Exclusive has a collection for you.
        </p>
      </div>
    </section>
  );
}
