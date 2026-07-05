"use client";

import { motion } from "framer-motion";
import { FaRegHeart } from "react-icons/fa";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";

export default function NewArrivals() {
  const products = [
    {
      name: "Streetwear Hoodie",
      price: "$45",
      category: "Streetwear",
    },
    {
      name: "Fightwear Tee",
      price: "$35",
      category: "Fightwear",
    },
    {
      name: "Sports Shorts",
      price: "$30",
      category: "Sportswear",
    },
    {
      name: "Training Jersey",
      price: "$40",
      category: "Performance",
    },
  ];

  return (
    <section className="max-w-[1700px] mx-auto px-8 lg:px-12 py-32">
      {/* Header */}
      <div className="text-center mb-20">
        <p className="uppercase tracking-[0.5em] text-gray-500 text-sm mb-4">
          Ender Exclusive
        </p>

        <h2 className="text-5xl md:text-6xl font-black mb-6">New Arrivals</h2>

        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Discover the latest additions to our premium collections, crafted for
          performance, comfort and style.
        </p>
      </div>

      {/* Products */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: index * 0.15,
            }}
            className="group"
          >
            <div
              className="
                bg-white
                rounded-[32px]
                overflow-hidden
                shadow-lg
                hover:shadow-2xl
                transition-all
                duration-500
              "
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <div
                  className="
                    h-[420px]
                    bg-gradient-to-br
                    from-black
                    via-gray-900
                    to-gray-700
                    transition-all
                    duration-700
                    group-hover:scale-105
                  "
                />

                {/* Badge */}
                <div
                  className="
                    absolute
                    top-5
                    left-5
                    bg-white
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-medium
                  "
                >
                  NEW
                </div>

                {/* Wishlist */}
                <button
                  className="
                    absolute
                    top-5
                    right-5
                    w-12
                    h-12
                    rounded-full
                    bg-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    hover:bg-black
                    hover:text-white
                    transition-all
                  "
                >
                  <FaRegHeart />
                </button>
              </div>

              {/* Content */}
              <div className="p-7">
                <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">
                  {product.category}
                </p>

                <h3 className="text-2xl font-bold mb-3">{product.name}</h3>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-black">{product.price}</span>

                  <span className="text-green-600 text-sm font-semibold">
                    In Stock
                  </span>
                </div>

                <button
                  className="
                    w-full
                    bg-black
                    text-white
                    py-4
                    rounded-full
                    flex
                    items-center
                    justify-center
                    gap-3
                    font-semibold
                    hover:bg-gray-800
                    transition-all
                  "
                >
                  <FiShoppingBag />
                  Add To Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-16">
        <button
          className="
            border-2
            border-black
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
          "
        >
          View All Products
          <FiArrowRight />
        </button>
      </div>
    </section>
  );
}
