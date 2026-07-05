"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";

import {
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import { FaFire } from "react-icons/fa";

export default function OnSalePage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();

        const filteredProducts = data.filter(
          (product) => product.isOnSale === true && product.status === "active",
        );

        setSaleProducts(filteredProducts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-pulse">
              <FaFire className="text-yellow-400" />
              <span className="text-sm font-semibold">Limited Time Offer</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-4">Flash Sale!</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Up to 70% OFF on selected items. Hurry up! Stocks are limited.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <HiOutlineClock className="text-2xl" />
                <span className="font-semibold">Limited Time</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineShieldCheck className="text-2xl" />
                <span className="font-semibold">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineTruck className="text-2xl" />
                <span className="font-semibold">Free Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Empty State */}
        {saleProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFire className="text-5xl text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              No Sale Products
            </h2>
            <p className="text-gray-500 mb-8">
              No discounted products available right now. Check back soon!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {saleProducts.map((product) => {
                const discountPercent = Math.round(
                  ((product.price - product.salePrice) / product.price) * 100,
                );

                return (
                  <div
                    key={product.id}
                    className="group relative"
                    onMouseEnter={() => setHoveredCard(product.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Animated Border Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>

                    {/* Card */}
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                      {/* Image Section */}
                      <Link href={`/on-sale/${product.id}`}>
                        <div className="relative h-64 lg:h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer">
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />

                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                            <button
                              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                              onClick={(e) => e.preventDefault()}
                            >
                              <HiOutlineHeart className="text-xl" />
                            </button>
                            <button
                              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75"
                              onClick={(e) => e.preventDefault()}
                            >
                              <HiOutlineShoppingCart className="text-xl" />
                            </button>
                          </div>

                          {/* Discount Badge */}
                          <div className="absolute top-4 left-4">
                            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                              <FaFire className="text-xs" />-{discountPercent}%
                            </div>
                          </div>

                          {/* Limited Stock Badge */}
                          {product.stock < 20 && (
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium text-center">
                                🔥 Only {product.stock} left - Hurry up!
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Content Section */}
                      <div className="p-5">
                        {/* Category Tag */}
                        <div className="mb-2">
                          <span className="text-xs text-gray-400 uppercase tracking-wider">
                            {product.category || "Premium"}
                          </span>
                        </div>

                        {/* Title */}
                        <Link href={`/on-sale/${product.id}`}>
                          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1 hover:text-red-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Price Section */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl font-bold text-red-600">
                              Rs. {product.salePrice?.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              Rs. {product.price?.toLocaleString()}
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              Save {discountPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Color Options */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs text-gray-500">
                              Colors:
                            </span>
                            <div className="flex gap-1">
                              {product.colors
                                .slice(0, 3)
                                .map((color: string) => (
                                  <div
                                    key={color}
                                    className="w-4 h-4 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                                    style={{
                                      backgroundColor: color.toLowerCase(),
                                    }}
                                    title={color}
                                  />
                                ))}
                              {product.colors.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{product.colors.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Delivery Info */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                          <HiOutlineTruck className="text-sm" />
                          {product.deliveryType === "free" ? (
                            <span className="text-green-600">
                              Free Delivery
                            </span>
                          ) : (
                            <span>
                              Delivery: Rs.{" "}
                              {product.deliveryCharge?.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          className="relative w-full py-3 rounded-xl font-semibold overflow-hidden group/btn transition-all duration-300"
                          onClick={(e) => e.preventDefault()}
                        >
                          <span className="absolute inset-0 bg-black"></span>
                          <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></span>
                          <span className="relative flex items-center justify-center gap-2 text-white z-10">
                            <HiOutlineShoppingCart className="text-lg" />
                            Add to Cart
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Didn't find what you're looking for?
                </h3>
                <p className="text-gray-500 mb-6">
                  Check out our full collection for more amazing products
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all hover:scale-105"
                >
                  Browse All Products
                  <HiOutlineShoppingCart className="text-lg" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
