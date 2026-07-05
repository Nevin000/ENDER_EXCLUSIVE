"use client";

import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export default function Categories() {
  const categories = [
    {
      title: "Men's Wear",
      subtitle: "Premium streetwear essentials",
    },
    {
      title: "Fight Wear",
      subtitle: "Built for champions",
    },
    {
      title: "Sports Wear",
      subtitle: "Performance meets style",
    },
  ];

  return (
    <section className="max-w-[1700px] mx-auto px-8 lg:px-12 py-32">
      {/* Header */}
      <div className="text-center mb-20">
        <p className="uppercase tracking-[0.5em] text-gray-500 text-sm mb-4">
          Ender Exclusive
        </p>

        <h2 className="text-5xl md:text-6xl font-black mb-6">
          Shop By Category
        </h2>

        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Discover premium collections crafted for athletes, fighters and modern
          lifestyles.
        </p>
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-3 gap-8">
        {categories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: index * 0.15,
            }}
            whileHover={{
              y: -10,
            }}
            className="group"
          >
            <div
              className="
                relative
                h-[550px]
                rounded-[36px]
                overflow-hidden
                cursor-pointer
                shadow-lg
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
                  transition-all
                  duration-700
                  group-hover:scale-110
                "
              />

              {/* Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-black/20
                  group-hover:bg-black/35
                  transition-all
                  duration-500
                "
              />

              {/* Badge */}
              <div
                className="
                  absolute
                  top-6
                  left-6
                  bg-white/10
                  backdrop-blur-md
                  border
                  border-white/20
                  text-white
                  px-4
                  py-2
                  rounded-full
                  text-sm
                "
              >
                Collection
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
                  p-10
                "
              >
                <h3 className="text-4xl font-bold text-white mb-4">
                  {category.title}
                </h3>

                <p className="text-gray-300 text-lg mb-8">
                  {category.subtitle}
                </p>

                <button
                  className="
                    w-fit
                    bg-white
                    text-black
                    px-7
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
    </section>
  );
}
