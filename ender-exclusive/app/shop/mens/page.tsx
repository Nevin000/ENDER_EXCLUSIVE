"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";

import {
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineEye,
} from "react-icons/hi2";

export default function MensPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();

        const mensProducts = data.filter(
          (product) =>
            product.status === "active" &&
            product.category === "mens" &&
            product.isOnSale !== true,
        );

        setProducts(mensProducts);
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
      <div className="min-h-screen flex items-center justify-center">
        Loading Products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold mb-4">Men's Wear</h1>

          <p className="text-lg text-gray-300">
            Premium Men's Collection by Ender Exclusive
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="mb-8 text-gray-500">Showing {products.length} Products</p>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold">No Men's Products Found</h2>

            <p className="text-gray-500 mt-3">
              Products will appear here once added.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <div key={product.id} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500 to-gray-700 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>

                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                    {/* Image */}
                    <div className="relative h-72 bg-gray-100 overflow-hidden">
                      <Link href={`/shop/${product.id}`}>
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>

                      {/* Hover Icons */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white">
                          <HiOutlineHeart />
                        </button>

                        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white">
                          <HiOutlineShoppingCart />
                        </button>

                        <Link
                          href={`/shop/${product.id}`}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white"
                        >
                          <HiOutlineEye />
                        </Link>
                      </div>

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <Link href={`/shop/${product.id}`}>
                        <h3 className="font-bold text-lg mb-2 hover:text-gray-600 transition">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mb-4">
                        <span
                          className={`text-2xl font-bold ${
                            isOutOfStock ? "text-gray-400" : "text-gray-800"
                          }`}
                        >
                          Rs. {product.price.toLocaleString()}
                        </span>
                      </div>

                      <button
                        disabled={isOutOfStock}
                        className={`w-full py-3 rounded-xl font-semibold transition ${
                          isOutOfStock
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
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
