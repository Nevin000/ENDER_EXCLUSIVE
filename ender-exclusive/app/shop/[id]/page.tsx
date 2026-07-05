"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { getProductById } from "@/services/productService";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

import {
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiCheck,
  HiOutlineMinus,
  HiOutlinePlus,
} from "react-icons/hi2";

import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [availableStock, setAvailableStock] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const { user } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductById(productId);
        if (!data) {
          setProduct(null);
          return;
        }
        setProduct(data);
        setAvailableStock(data.stock || 0);
        setSelectedSize("");
        setSelectedColor("");
        setQuantity(1);
        setActiveImage(0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (!product) return;

    if (selectedColor && selectedSize) {
      const matchedSize = product.sizes?.find(
        (s) => s.size === selectedSize && (s as any).color === selectedColor
      );
      if (matchedSize) {
        setAvailableStock(matchedSize.stock);
      } else {
        setAvailableStock(0);
      }
    } else if (selectedColor) {
      const colorSizes = product.sizes?.filter((s) => (s as any).color === selectedColor) || [];
      const totalColorStock = colorSizes.reduce((sum, s) => sum + s.stock, 0);
      setAvailableStock(totalColorStock > 0 ? totalColorStock : 0);
    } else if (selectedSize) {
      const sizeStock = product.sizes?.filter((s) => s.size === selectedSize) || [];
      const totalSizeStock = sizeStock.reduce((sum, s) => sum + s.stock, 0);
      setAvailableStock(totalSizeStock > 0 ? totalSizeStock : 0);
    } else {
      setAvailableStock(product.stock || 0);
    }
  }, [selectedColor, selectedSize, product]);

  const getUniqueSizes = () => {
    if (!product?.sizes) return [];
    return [...new Map(product.sizes.map((s) => [s.size, s])).values()];
  };

  const getSizeStock = (size: string) => {
    if (!product?.sizes) return 0;
    const sizes = product.sizes.filter((s) => s.size === size);
    return sizes.reduce((sum, s) => sum + s.stock, 0);
  };

  const getColorStock = (color: string) => {
    if (!product?.sizes) return 0;
    const colorSizes = product.sizes.filter((s) => (s as any).color === color);
    return colorSizes.reduce((sum, s) => sum + s.stock, 0);
  };

  const isSizeAvailableForSelectedColor = (color: string, size: string) => {
    if (!product?.sizes) return false;
    return product.sizes.some(
      (s) => (s as any).color === color && s.size === size && s.stock > 0
    );
  };

  const getSpecificStock = (color: string, size: string) => {
    if (!product?.sizes) return 0;
    const matched = product.sizes.find(
      (s) => s.size === size && (s as any).color === color
    );
    return matched ? matched.stock : 0;
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (selectedSize && !isSizeAvailableForSelectedColor(color, selectedSize)) {
      setSelectedSize("");
    }
    setQuantity(1);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!product) {
      alert("Product not found.");
      return;
    }

    if (!selectedColor) {
      alert("Please select a color.");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }

    if (availableStock <= 0) {
      alert("Out of Stock");
      return;
    }

    setAddingToCart(true);

    try {
      // 🔥 Add userId to cart item
      await addItem({
        userId: user.uid,
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || "/placeholder.png",
        color: selectedColor,
        size: selectedSize,
        quantity,
        price: product.price,
        salePrice: product.salePrice,
        isOnSale: product.isOnSale,
        stock: availableStock,
        deliveryCharge: product.deliveryCharge || 0,
      });

      alert("Added to cart successfully!");

      // Reset selection after adding
      setSelectedColor("");
      setSelectedSize("");
      setQuantity(1);

    } catch (error: any) {
      console.error("Error adding to cart:", error);
      alert(error.message || "Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <HiOutlineShoppingCart className="text-5xl text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Product Not Found</h1>
        <p className="text-gray-500 mb-6 text-center">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/shop"
          className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all inline-flex items-center gap-2 hover:scale-105"
        >
          Back To Shop
        </Link>
      </div>
    );
  }

  const hasMultipleImages = product.images && product.images.length > 1;
  const isOutOfStock = availableStock === 0;
  const canAddToCart = !isOutOfStock && selectedColor && selectedSize && !addingToCart;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-black transition">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-black transition">Shop</Link>
              <span>/</span>
              <span className="text-black font-medium line-clamp-1">{product.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWishlist(!wishlist)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <HiOutlineHeart className={`text-xl ${wishlist ? 'text-red-500 fill-red-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative group bg-white rounded-2xl overflow-hidden shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <img
                    src={product.images?.[activeImage] || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <HiOutlineChevronLeft className="text-2xl" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <HiOutlineChevronRight className="text-2xl" />
                  </button>
                </>
              )}

              {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {activeImage + 1} / {product.images.length}
                </div>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx
                        ? "border-black shadow-md scale-105"
                        : "border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                {product.category || "Premium Collection"}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
              {product.name}
            </h1>

            <div className="bg-gray-50 rounded-2xl p-6">
              <span className="text-3xl lg:text-4xl font-bold text-gray-800">
                Rs. {product.price?.toLocaleString()}
              </span>
            </div>

            <div>
              <p className="text-gray-600 leading-relaxed">
                {product.description ||
                  "Premium quality product with excellent craftsmanship. Designed for comfort and durability."}
              </p>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Color</h3>
                  {selectedColor && (
                    <span className="text-sm text-gray-500">
                      Selected: <span className="font-medium">{selectedColor}</span>
                    </span>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => {
                    const colorStock = getColorStock(color);
                    const isOutOfStock = colorStock === 0;

                    return (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        disabled={isOutOfStock}
                        className="group relative"
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color
                              ? "border-black ring-2 ring-black/20 scale-110"
                              : "border-gray-300 hover:scale-105"
                            } ${isOutOfStock ? "opacity-40 cursor-not-allowed" : ""}`}
                          style={{ backgroundColor: color.toLowerCase() }}
                        >
                          {selectedColor === color && (
                            <HiCheck className="text-white text-sm drop-shadow-lg" />
                          )}
                        </div>
                        {isOutOfStock && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">×</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {getUniqueSizes().length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Size</h3>
                  {selectedSize && (
                    <span className="text-sm text-gray-500">
                      Selected: <span className="font-medium">{selectedSize}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {getUniqueSizes().map((size) => {
                    const isAvailable = selectedColor
                      ? isSizeAvailableForSelectedColor(selectedColor, size.size)
                      : true;
                    const specificStock = selectedColor
                      ? getSpecificStock(selectedColor, size.size)
                      : getSizeStock(size.size);
                    const isOutOfStock = !isAvailable || specificStock === 0;

                    return (
                      <button
                        key={size.size}
                        onClick={() => !isOutOfStock && handleSizeSelect(size.size)}
                        disabled={isOutOfStock}
                        className={`relative w-14 h-14 rounded-xl border-2 font-semibold transition-all ${selectedSize === size.size
                            ? "border-black bg-black text-white scale-105"
                            : isOutOfStock
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                              : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                      >
                        {size.size}
                      </button>
                    );
                  })}
                </div>
                {selectedColor && !selectedSize && (
                  <p className="text-xs text-blue-600 mt-2">
                    👆 Select a size to continue
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Availability:</span>
                <span
                  className={`font-semibold ${isOutOfStock
                      ? "text-red-600"
                      : availableStock < 10
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : availableStock < 10
                      ? `Only ${availableStock} left!`
                      : `${availableStock} available`}
                </span>
              </div>
            </div>

            {!isOutOfStock && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <HiOutlineMinus className="text-lg" />
                    </button>
                    <span className="w-16 text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      disabled={quantity >= availableStock}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      <HiOutlinePlus className="text-lg" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Max: {availableStock} units
                  </span>
                </div>
              </div>
            )}

            {availableStock > 0 && availableStock < 10 && (
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <p className="text-sm text-orange-700 font-medium">
                  ⚠️ Hurry! Only {availableStock} left in stock!
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <HiOutlineTruck className="text-2xl mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">Delivery</p>
                {product.deliveryCharge === 0 ? (
                  <p className="text-xs text-green-600 font-semibold">FREE Delivery</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Rs. {product.deliveryCharge?.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <HiOutlineShieldCheck className="text-2xl mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium">Returns</p>
                <p className="text-xs text-gray-500">30 Day Easy Returns</p>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${canAddToCart
                    ? "bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:scale-[1.02]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {addingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <HiOutlineShoppingCart className="text-xl" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                disabled={!canAddToCart}
                className={`flex-1 border-2 py-4 rounded-xl font-semibold transition-all ${canAddToCart
                    ? "border-gray-300 hover:border-black hover:bg-black hover:text-white"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Buy Now
              </button>
            </div>

            {(!selectedColor || !selectedSize) && !isOutOfStock && (
              <p className="text-xs text-amber-600 text-center">
                Please select both {!selectedColor ? "color" : ""}
                {!selectedColor && !selectedSize && " and "}
                {!selectedSize ? "size" : ""} to add to cart
              </p>
            )}

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Share this product:</p>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                  <FaFacebook />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-pink-600 hover:text-white transition">
                  <FaInstagram />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-400 hover:text-white transition">
                  <FaTwitter />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}