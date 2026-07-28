"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getProductById } from "@/services/productService";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  Flame,
  ShieldCheck,
  Truck,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  ArrowLeft,
  Share2,
  Sparkles,
  RotateCcw,
} from "lucide-react";

export default function OnSaleProductPage() {
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

  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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
        console.error("Error loading sale product:", error);
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
      setAvailableStock(matchedSize ? matchedSize.stock : 0);
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

  // Derive active gallery images for selected color or general product photos
  const galleryImages = useMemo(() => {
    if (!product) return [];

    if (selectedColor) {
      const variantMatch = product.colorVariants?.find(
        (v) => v.color?.toLowerCase() === selectedColor.toLowerCase()
      );
      if (variantMatch) {
        if (variantMatch.images && variantMatch.images.length > 0) {
          return variantMatch.images;
        }
        if (variantMatch.imageUrl) {
          return [variantMatch.imageUrl];
        }
      }

      if (product.colorImages && product.colorImages.length > 0) {
        const colorFiltered = product.colorImages
          .filter((ci) => ci.color?.toLowerCase() === selectedColor.toLowerCase())
          .map((ci) => ci.url);
        if (colorFiltered.length > 0) {
          return colorFiltered;
        }
      }
    }

    return product.images && product.images.length > 0
      ? product.images
      : ["/lookbook/look_book_banner.avif"];
  }, [product, selectedColor]);

  const discountPercent = product?.isOnSale && product.price && product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setActiveImage(0);
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
      alert("Please login first to add items to your cart.");
      return;
    }

    if (!product) return;

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert("Please select a color.");
      return;
    }

    if (getUniqueSizes().length > 0 && !selectedSize) {
      alert("Please select a size.");
      return;
    }

    if (availableStock <= 0) {
      alert("Selected item is out of stock.");
      return;
    }

    setAddingToCart(true);

    try {
      await addItem({
        userId: user.uid,
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || "/lookbook/look_book_banner.avif",
        color: selectedColor || "Default",
        size: selectedSize || "Standard",
        quantity,
        price: product.price,
        salePrice: product.salePrice,
        isOnSale: product.isOnSale,
        stock: availableStock,
        deliveryCharge: product.deliveryCharge || 0,
      });

      alert("Added to cart successfully!");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070707] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-red-500">
          Loading Flash Deal Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070707] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="p-6 bg-zinc-100 dark:bg-[#111111] rounded-full border border-zinc-200 dark:border-zinc-800 text-red-500">
          <Flame className="w-12 h-12 fill-red-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-black uppercase tracking-tight">Flash Sale Item Not Found</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            This discounted item may have expired or is no longer available.
          </p>
        </div>
        <Link
          href="/on-sale"
          className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-xl hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back To All Sale Deals</span>
        </Link>
      </div>
    );
  }

  const hasMultipleImages = galleryImages.length > 1;
  const isOutOfStock = availableStock === 0;
  const unitPrice = product.salePrice || product.price || 0;
  const totalPrice = unitPrice * quantity;

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300 pb-28">

      {/* ===== STICKY BREADCRUMB HEADER (Navbar Aligned Container Width) ===== */}
      <div className="bg-zinc-50/90 dark:bg-[#101010]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 py-4">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 overflow-x-auto">
            <Link href="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
            <span>/</span>
            <Link href="/on-sale" className="hover:text-black dark:hover:text-white transition">On Sale</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-bold line-clamp-1">{product.name}</span>
          </div>

          <button
            onClick={() =>
              toggleWishlist({
                productId: product.id,
                name: product.name,
                image: (product.images && product.images[0]) || "",
                price: product.price,
                salePrice: product.salePrice,
                isOnSale: true,
                category: product.category,
              })
            }
            className="p-2.5 rounded-full bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:scale-110 transition cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                isInWishlist(product.id) ? "text-red-500 fill-red-500" : "text-zinc-600 dark:text-zinc-300"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ===== MAIN PRODUCT DISPLAY CONTAINER ===== */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ===== 1. LEFT COLUMN: IMAGE GALLERY ===== */}
          <div className="space-y-4">
            <div className="relative group aspect-[4/5] bg-zinc-100 dark:bg-[#121212] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={galleryImages[activeImage] || galleryImages[0] || "/lookbook/look_book_banner.avif"}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover filter brightness-95 contrast-105"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Red Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-5 left-5 z-20">
                  <span className="px-4 py-2 bg-red-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-2xl flex items-center gap-1.5">
                    <Flame className="w-4 h-4 fill-white" />
                    -{discountPercent}% OFF
                  </span>
                </div>
              )}

              {/* Prev / Next Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {hasMultipleImages && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${activeImage === idx
                        ? "border-red-600 ring-2 ring-red-600/30 scale-105"
                        : "border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
                      }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== 2. RIGHT COLUMN: PRODUCT DETAILS & SEPARATE PRICING BOX ===== */}
          <div className="space-y-6">
            
            {/* Category Pill & Flash Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-red-500" />
                <span>FLASH SALE DEAL</span>
              </span>
              <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium uppercase tracking-wider">
                {product.category || "LIMITED EDITION"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* ===== SEPARATE & CLEAR PRICE DISPLAY BOX ===== */}
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-zinc-400 block mb-1">
                    Special Flash Price
                  </span>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-600 dark:text-red-500">
                      Rs. {unitPrice?.toLocaleString()}
                    </span>
                    {product.price && product.salePrice && product.price > product.salePrice && (
                      <span className="text-xl font-normal text-zinc-400 line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {discountPercent > 0 && (
                  <span className="px-4 py-2 rounded-2xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              {/* Total Calculation Row */}
              <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                <span>Order Total ({quantity} {quantity === 1 ? "Item" : "Items"}):</span>
                <span className="text-xl text-zinc-900 dark:text-white font-bold">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
              {product.description ||
                "Engineered with heavyweight premium fabrics, athletic ergonomics, and durable stitching built for fight training, active lifestyle, and everyday confidence."}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Select Color</h3>
                  {selectedColor && (
                    <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                      Selected: {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => {
                    const colorStock = getColorStock(color);
                    const isColorOut = colorStock === 0;

                    return (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        disabled={isColorOut}
                        className={`group relative p-1 rounded-full border-2 transition-all cursor-pointer ${
                          selectedColor === color
                            ? "border-red-600 ring-4 ring-red-600/20 scale-110"
                            : "border-zinc-300 dark:border-zinc-700 hover:scale-105"
                        } ${isColorOut ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <div
                          className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: color.toLowerCase() }}
                        >
                          {selectedColor === color && (
                            <Check className="w-4 h-4 text-white drop-shadow-md" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {getUniqueSizes().length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Select Size</h3>
                  {selectedSize && (
                    <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                      Selected: {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {getUniqueSizes().map((size) => {
                    const isAvailable = selectedColor
                      ? isSizeAvailableForSelectedColor(selectedColor, size.size)
                      : true;
                    const specificStock = getSizeStock(size.size);
                    const isSizeOut = !isAvailable || specificStock === 0;

                    return (
                      <button
                        key={size.size}
                        onClick={() => !isSizeOut && handleSizeSelect(size.size)}
                        disabled={isSizeOut}
                        className={`w-14 h-14 rounded-2xl border-2 font-bold text-base uppercase transition-all cursor-pointer flex items-center justify-center ${
                          selectedSize === size.size
                            ? "border-red-600 bg-red-600 text-white shadow-lg scale-105"
                            : isSizeOut
                            ? "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#181818] text-zinc-400 cursor-not-allowed line-through"
                            : "border-zinc-300 dark:border-zinc-700 hover:border-red-500 hover:text-red-500 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {size.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Status Bar */}
            <div className="p-4.5 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm font-medium uppercase tracking-wider">
              <span className="text-zinc-500">Stock Availability:</span>
              <span className={isOutOfStock ? "text-red-500 font-bold" : availableStock < 10 ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                {isOutOfStock ? "Out of Stock" : availableStock < 10 ? `🔥 Only ${availableStock} left in stock!` : `${availableStock} Units Available`}
              </span>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Select Quantity</h3>
                  <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-[#141414]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      disabled={quantity >= availableStock}
                      className="w-12 h-12 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ===== ITEMIZED PRICE SUMMARY BREAKDOWN LIST ===== */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <span>Unit Flash Price:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Rs. {unitPrice?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <span>Selected Quantity:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      x {quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <span>Delivery Charge:</span>
                    {product.deliveryCharge === 0 || !product.deliveryCharge ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs">
                        FREE Delivery
                      </span>
                    ) : (
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Rs. {product.deliveryCharge.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    <span>Total Amount:</span>
                    <span className="text-xl text-red-600 dark:text-red-500 font-bold">
                      Rs. {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart CTA */}
            <div className="pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-xl cursor-pointer ${
                  !isOutOfStock
                    ? "bg-red-600 hover:bg-red-500 text-white hover:scale-[1.01]"
                    : "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>
            </div>

            {/* Delivery & Assurance Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Fast Delivery</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Islandwide Sri Lanka Dispatch</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 text-center">
                <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Authentic Quality</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">100% Guaranteed Genuine</p>
              </div>
            </div>

            {/* ===== RETURN & EXCHANGE POLICY ASSURANCE CARD ===== */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-500">
                  <RotateCcw className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Ender 14-Day Return & Exchange Policy</h4>
                </div>
                <Link
                  href="/return-and-exchange-policy-ender-wear"
                  className="text-xs font-bold text-amber-500 hover:underline uppercase tracking-wider"
                >
                  Read Full Policy →
                </Link>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                Enjoy 14 days from delivery to initiate a return or size exchange. Items must be in unworn, unwashed condition with tags intact.
              </p>
            </div>

          </div>

        </div>
      </div>

    </main>
  );
}