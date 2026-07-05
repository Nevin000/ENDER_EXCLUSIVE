"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlineMinus,
  HiOutlinePlus,
  HiArrowLeft,
  HiCheck,
} from "react-icons/hi2";
import { FaTruck, FaShieldAlt, FaClock } from "react-icons/fa";

import { CartItem } from "@/types/cart";

export default function CartPage() {
  const {
    cart,
    loading,
    increaseQty,
    decreaseQty,
    removeItem,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Auto-select all items when cart loads
  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems(new Set(cart.map((item: CartItem) => item.id)));
    }
  }, [cart]);

  const toggleSelectAll = () => {
    if (selectedItems.size === cart.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.map((item: CartItem) => item.id)));
    }
  };

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Get selected items
  const selectedCartItems = useMemo(() => {
    return cart.filter((item: CartItem) => selectedItems.has(item.id));
  }, [cart, selectedItems]);

  // Calculate total quantity
  const totalQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Calculate selected quantity
  const selectedQuantity = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedCartItems]);

  // Separate free delivery and paid delivery items
  const { freeDeliveryItems, paidDeliveryItems } = useMemo(() => {
    const free = selectedCartItems.filter((item: CartItem) => (item.deliveryCharge ?? 0) === 0);
    const paid = selectedCartItems.filter((item: CartItem) => (item.deliveryCharge ?? 0) > 0);
    return { freeDeliveryItems: free, paidDeliveryItems: paid };
  }, [selectedCartItems]);

  // Calculate subtotals
  const freeDeliverySubtotal = useMemo(() => {
    return freeDeliveryItems.reduce((total: number, item: CartItem) => {
      const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
      return total + price * item.quantity;
    }, 0);
  }, [freeDeliveryItems]);

  const paidDeliverySubtotal = useMemo(() => {
    return paidDeliveryItems.reduce((total: number, item: CartItem) => {
      const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
      return total + price * item.quantity;
    }, 0);
  }, [paidDeliveryItems]);

  // 🔥 FIX: Delivery charge - per item, NOT multiplied by quantity
  const totalDeliveryCharge = useMemo(() => {
    return selectedCartItems.reduce((total: number, item: CartItem) => {
      const charge = item.deliveryCharge ?? 0;
      // 🔥 Just add the delivery charge once per item (not × quantity)
      return total + charge;
    }, 0);
  }, [selectedCartItems]);

  // Calculate items subtotal
  const itemsSubtotal = freeDeliverySubtotal + paidDeliverySubtotal;
  const grandTotal = itemsSubtotal + totalDeliveryCharge;

  const isAllSelected = cart.length > 0 && selectedItems.size === cart.length;
  const hasSelected = selectedItems.size > 0;
  const hasDeliveryCharge = selectedCartItems.some((item: CartItem) => (item.deliveryCharge ?? 0) > 0);

  // Handle quantity with loading state
  const handleIncreaseQty = async (id: string) => {
    setUpdatingId(id);
    try {
      await increaseQty(id);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecreaseQty = async (id: string) => {
    setUpdatingId(id);
    try {
      await decreaseQty(id);
    } finally {
      setUpdatingId(null);
    }
  };

  // Remove with confirmation
  const handleRemoveItem = (id: string) => {
    if (confirm("Remove this product from your cart?")) {
      removeItem(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-gray-500">Loading Cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineShoppingBag className="text-6xl text-gray-300" />
          </div>
          <h1 className="text-4xl font-bold">Your Cart is Empty</h1>
          <p className="text-gray-500 mt-3">Looks like you haven't added anything yet.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-8 bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 hover:scale-105 transition-all duration-300"
          >
            <HiArrowLeft />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition"
        >
          <HiArrowLeft />
          Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {/* Select All */}
          {cart.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex items-center justify-between">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-3 text-sm font-medium hover:text-black transition"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${isAllSelected
                    ? 'bg-black border-black'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}>
                  {isAllSelected && (
                    <HiCheck className="text-white text-sm" />
                  )}
                </div>
                Select All ({totalQuantity} items)
              </button>

              <span className="text-sm text-gray-400">
                {selectedQuantity} selected
              </span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-4">
            <AnimatePresence>
              {cart.map((item: CartItem) => {
                const isSelected = selectedItems.has(item.id);
                const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                const deliveryCharge = item.deliveryCharge ?? 0;
                const isFreeDelivery = deliveryCharge === 0;
                // 🔥 FIX: Delivery charge is per item, NOT × quantity
                const itemDeliveryTotal = deliveryCharge; // Just once per item
                const itemTotal = price * item.quantity;
                const isUpdating = updatingId === item.id;
                const isLowStock = item.stock < 5;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`bg-white rounded-2xl border-2 transition-all duration-300 p-4 sm:p-5 ${isSelected
                        ? 'border-black shadow-lg shadow-black/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Select Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item.id);
                        }}
                        className="mt-1 shrink-0"
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${isSelected
                            ? 'bg-black border-black'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}>
                          {isSelected && (
                            <HiCheck className="text-white text-sm" />
                          )}
                        </div>
                      </button>

                      {/* Product Image */}
                      <Link href={`/shop/${item.productId}`} className="shrink-0">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-contain bg-gray-50 hover:scale-105 transition"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link href={`/shop/${item.productId}`}>
                              <h2 className="text-base sm:text-lg font-bold hover:text-gray-600 transition truncate">
                                {item.name}
                              </h2>
                            </Link>

                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs">
                                {item.color}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs">
                                {item.size}
                              </span>
                              {!isFreeDelivery && (
                                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium flex items-center gap-1">
                                  <FaTruck className="text-[10px]" />
                                  Delivery: Rs. {deliveryCharge}
                                </span>
                              )}
                            </div>

                            {/* Low stock warning */}
                            {isLowStock && (
                              <p className="text-red-500 text-xs font-medium mt-2">
                                Only {item.stock} left in stock!
                              </p>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            {item.isOnSale ? (
                              <div>
                                <span className="text-lg sm:text-xl font-bold text-red-600">
                                  Rs. {item.salePrice?.toLocaleString()}
                                </span>
                                <span className="text-gray-400 line-through text-sm ml-2">
                                  Rs. {item.price.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg sm:text-xl font-bold">
                                Rs. {item.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                          {/* Quantity buttons */}
                          <div className="flex items-center border rounded-xl overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecreaseQty(item.id);
                              }}
                              disabled={isUpdating || item.quantity <= 1}
                              className="w-9 h-9 sm:w-10 sm:h-10 hover:bg-gray-100 flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              <HiOutlineMinus className="text-sm" />
                            </button>

                            <div className="w-10 sm:w-14 text-center font-semibold text-sm">
                              {isUpdating ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                              ) : (
                                item.quantity
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIncreaseQty(item.id);
                              }}
                              disabled={isUpdating || item.quantity >= item.stock}
                              className="w-9 h-9 sm:w-10 sm:h-10 hover:bg-gray-100 flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              <HiOutlinePlus className="text-sm" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-gray-400 text-xs">Item Total</p>
                            <span className="font-bold text-sm sm:text-base">
                              Rs. {itemTotal.toLocaleString()}
                            </span>
                            {!isFreeDelivery && (
                              <p className="text-xs text-gray-400">
                                + Delivery: Rs. {itemDeliveryTotal.toLocaleString()}
                              </p>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition p-1"
                          >
                            <HiOutlineTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-5">Order Summary</h2>

            {!hasSelected ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HiOutlineShoppingBag className="text-3xl text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">Select items to checkout</p>
              </div>
            ) : (
              <>
                {/* Free Delivery Items */}
                {freeDeliveryItems.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-2">
                      <span>🎁 Free Delivery Items</span>
                      <span className="text-xs font-normal text-gray-400">
                        ({freeDeliveryItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-2 border-l-2 border-green-200">
                      {freeDeliveryItems.map((item: CartItem) => {
                        const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="font-medium text-green-600">
                              Rs. {(price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-green-100">
                        <span>Subtotal</span>
                        <span className="text-green-600">Rs. {freeDeliverySubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Delivery</span>
                        <span className="font-medium">FREE</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paid Delivery Items */}
                {paidDeliveryItems.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 mb-2">
                      <FaTruck className="text-sm" />
                      Standard Delivery Items
                      <span className="text-xs font-normal text-gray-400">
                        ({paidDeliveryItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-2 border-l-2 border-orange-200">
                      {paidDeliveryItems.map((item: CartItem) => {
                        const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                        // 🔥 FIX: Delivery is per item, not × quantity
                        const itemDelivery = item.deliveryCharge ?? 0;
                        return (
                          <div key={item.id}>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 truncate">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="font-medium">
                                Rs. {(price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 pl-4">
                              <span>Delivery: Rs.{item.deliveryCharge}</span>
                              <span>Rs. {itemDelivery.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-orange-100">
                        <span>Subtotal</span>
                        <span>Rs. {paidDeliverySubtotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <hr className="my-4" />

                {/* Grand Total Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Subtotal</span>
                    <span className="font-medium">
                      Rs. {itemsSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {hasDeliveryCharge && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Delivery</span>
                      <span className="font-medium text-orange-600">
                        Rs. {totalDeliveryCharge.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                {/* Total */}
                <div className="flex justify-between text-xl font-bold">
                  <span>Grand Total</span>
                  <span>Rs. {grandTotal.toLocaleString()}</span>
                </div>

                {/* Delivery Charges Breakdown */}
                {hasDeliveryCharge && (
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <p className="text-orange-700 text-xs font-medium mb-2">
                      Delivery Charges Breakdown
                    </p>
                    <div className="space-y-1">
                      {paidDeliveryItems.map((item: CartItem) => {
                        const charge = item.deliveryCharge ?? 0;
                        return (
                          <div key={item.id} className="flex justify-between text-xs text-gray-600">
                            <span className="truncate">
                              {item.name}
                            </span>
                            <span>
                              Rs. {charge}
                            </span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between text-xs font-semibold pt-1 border-t border-orange-200">
                        <span>Total Delivery</span>
                        <span>Rs. {totalDeliveryCharge.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <Link
                  href={hasSelected ? "/checkout" : "#"}
                  onClick={(e) => {
                    if (!hasSelected) {
                      e.preventDefault();
                    }
                  }}
                  className={`mt-5 w-full h-12 rounded-xl flex items-center justify-center font-semibold transition ${hasSelected
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  Checkout ({selectedQuantity} items)
                </Link>

                <div className="mt-5 pt-4 border-t space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock />
                    Fast Delivery
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}