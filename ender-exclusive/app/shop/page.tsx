"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";

import {
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineEye,
} from "react-icons/hi2";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        const regularProducts = data.filter(
          (product) => product.status === "active" && product.isOnSale !== true,
        );
        setProducts(regularProducts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }
    return filtered;
  }, [products, selectedCategory]);

  const categories = [
    { id: "all", name: "All Products", icon: "🎯", count: products.length },
    {
      id: "mens",
      name: "Men's Wear",
      icon: "👔",
      count: products.filter((p) => p.category === "mens").length,
    },
    {
      id: "fightwear",
      name: "Fight Wear",
      icon: "🥊",
      count: products.filter((p) => p.category === "fightwear").length,
    },
    {
      id: "sportswear",
      name: "Sports Wear",
      icon: "🏃",
      count: products.filter((p) => p.category === "sportswear").length,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold">Ender Exclusive</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-4">
              Shop Collection
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Premium Streetwear • Fightwear • Sportswear
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
              <span className="ml-1 text-xs opacity-70">
                ({category.count})
              </span>
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-500">
            Showing{" "}
            <span className="font-semibold text-black">
              {filteredProducts.length}
            </span>{" "}
            products
          </p>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineShoppingCart className="text-5xl text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              No Products Found
            </h2>
            <p className="text-gray-500">
              Products will appear here once added from the admin panel.
            </p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredCard(product.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Animated Border Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500 to-gray-700 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>

                  {/* Card */}
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                    {/* Image Section - REMOVED the outer Link */}
                    <div className="relative h-64 lg:h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer">
                      <Link href={`/shop/${product.id}`}>
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>

                      {/* Overlay on Hover - Using divs instead of Links for icons */}
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
                        <Link
                          href={`/shop/${product.id}`}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-150"
                        >
                          <HiOutlineEye className="text-xl" />
                        </Link>
                      </div>

                      {/* Out of Stock Badge */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      {/* Category Tag */}
                      <div className="mb-2">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                          {product.category || "Premium"}
                        </span>
                      </div>

                      {/* Title - Now Link is only here, not nested */}
                      <Link href={`/shop/${product.id}`}>
                        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1 hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price Section */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className={`text-2xl font-bold ${isOutOfStock ? "text-gray-400" : "text-gray-800"}`}
                          >
                            Rs. {product.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Color Options */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs text-gray-500">Colors:</span>
                          <div className="flex gap-1">
                            {product.colors.slice(0, 3).map((color: string) => (
                              <div
                                key={color}
                                className="w-4 h-4 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: color.toLowerCase() }}
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

                      {/* Add to Cart Button */}
                      <button
                        disabled={isOutOfStock}
                        className={`relative w-full py-3 rounded-xl font-semibold overflow-hidden group/btn transition-all duration-300 ${
                          isOutOfStock
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={(e) => e.preventDefault()}
                      >
                        {!isOutOfStock && (
                          <>
                            <span className="absolute inset-0 bg-black"></span>
                            <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></span>
                          </>
                        )}
                        <span className="relative flex items-center justify-center gap-2 text-white z-10">
                          <HiOutlineShoppingCart className="text-lg" />
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
