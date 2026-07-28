"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { Zap } from "lucide-react";

import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

// Fallback real items if Firestore hasn't been populated yet
const MOCK_STORE_PRODUCTS: Product[] = [
  {
    id: "ender-hoodie-01",
    name: "Ender Heavyweight Street Hoodie",
    category: "Streetwear",
    price: 18000,
    salePrice: 14500,
    isOnSale: true,
    discountPercentage: 20,
    description: "Ultra-heavyweight 480GSM fleece hoodie with luxury metallic logo embroidery.",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
    ],
    colorImages: [],
    colorVariants: [],
    colors: ["Black", "Charcoal"],
    sizes: [{ size: "L", stock: 10 }],
    status: "in_stock",
    deliveryType: "free",
    deliveryCharge: 0,
  },
  {
    id: "ender-rashguard-02",
    name: "Pro Combat Compression Rashguard",
    category: "Fightwear",
    price: 13500,
    salePrice: 11200,
    isOnSale: true,
    discountPercentage: 17,
    description: "Professional 4-way stretch compression rashguard for MMA & BJJ training.",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
    ],
    colorImages: [],
    colorVariants: [],
    colors: ["Black/Gold"],
    sizes: [{ size: "M", stock: 15 }],
    status: "in_stock",
    deliveryType: "free",
    deliveryCharge: 0,
  },
  {
    id: "ender-shorts-03",
    name: "Championship MMA Fight Shorts",
    category: "Fightwear",
    price: 9800,
    salePrice: 9800,
    isOnSale: false,
    discountPercentage: 0,
    description: "Reinforced side-slit fight shorts engineered for maximum mobility and kicking power.",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop",
    ],
    colorImages: [],
    colorVariants: [],
    colors: ["Matte Black"],
    sizes: [{ size: "L", stock: 20 }],
    status: "in_stock",
    deliveryType: "free",
    deliveryCharge: 0,
  },
  {
    id: "ender-joggers-04",
    name: "Signature Athletic Tech Joggers",
    category: "Sportswear",
    price: 15000,
    salePrice: 12800,
    isOnSale: true,
    discountPercentage: 15,
    description: "Tapered performance athletic joggers with zippered waterproof pockets.",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop",
    ],
    colorImages: [],
    colorVariants: [],
    colors: ["Black", "Grey"],
    sizes: [{ size: "M", stock: 10 }],
    status: "in_stock",
    deliveryType: "free",
    deliveryCharge: 0,
  },
];

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>(MOCK_STORE_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchStoreProducts() {
      try {
        const liveProducts = await getProducts();
        if (liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        } else {
          setProducts(MOCK_STORE_PRODUCTS);
        }
      } catch (err) {
        console.error("Error fetching store products:", err);
        setProducts(MOCK_STORE_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchStoreProducts();
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white py-16 sm:py-20 lg:py-28 border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-300">
      {/* Container matching Navbar & Categories margin & padding */}
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
            <Zap className="w-3.5 h-3.5 fill-amber-500" />
            <span>FRESH DROP 2026</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase"
          >
            New <span className="text-amber-500">Arrivals</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto font-medium"
          >
            Explore our latest collection drops and high-grade apparel built for champions.
          </motion.p>

          {/* View Full Store Button (Centered) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6"
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-full hover:bg-amber-400 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black hover:scale-105 transition-all duration-300 shadow-md text-sm"
            >
              <span>Explore All Shop Items</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
