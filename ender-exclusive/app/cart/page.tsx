"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { FaTruck, FaShieldAlt, FaClock, FaFire, FaGift, FaTag } from "react-icons/fa";
import { SiVisa, SiMastercard, SiDiscover, SiAmericanexpress } from "react-icons/si";

import { CartItem } from "@/types/cart";

export default function CartPage() {
    const router = useRouter();
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

    // 🔥 Delivery charge - ONE TIME PER PRODUCT
    const totalDeliveryCharge = useMemo(() => {
        const uniqueProducts = new Map<string, number>();

        selectedCartItems.forEach((item) => {
            const charge = item.deliveryCharge ?? 0;
            if (!uniqueProducts.has(item.productId)) {
                uniqueProducts.set(item.productId, charge);
            }
        });

        return [...uniqueProducts.values()].reduce(
            (sum, charge) => sum + charge,
            0
        );
    }, [selectedCartItems]);

    // 🔥 Delivery Breakdown - Group by productId
    const deliveryBreakdown = useMemo(() => {
        const grouped = new Map<string, { name: string; charge: number; quantity: number }>();

        paidDeliveryItems.forEach((item) => {
            if (!grouped.has(item.productId)) {
                grouped.set(item.productId, {
                    name: item.name,
                    charge: item.deliveryCharge ?? 0,
                    quantity: 0,
                });
            }
            const existing = grouped.get(item.productId)!;
            existing.quantity += item.quantity;
        });

        return [...grouped.values()];
    }, [paidDeliveryItems]);

    // Calculate items subtotal
    const itemsSubtotal = freeDeliverySubtotal + paidDeliverySubtotal;
    const grandTotal = itemsSubtotal + totalDeliveryCharge;

    const isAllSelected = cart.length > 0 && selectedItems.size === cart.length;
    const hasSelected = selectedItems.size > 0;
    const hasDeliveryCharge = deliveryBreakdown.length > 0;

    // Check if all selected items have free delivery
    const allItemsFreeDelivery = useMemo(() => {
        return selectedCartItems.every((item: CartItem) => (item.deliveryCharge ?? 0) === 0);
    }, [selectedCartItems]);

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

    // Remove all selected items
    const handleRemoveSelected = () => {
        if (selectedItems.size === 0) return;
        if (confirm(`Remove ${selectedItems.size} selected items?`)) {
            selectedItems.forEach(id => removeItem(id));
            setSelectedItems(new Set());
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
                    <p className="text-gray-600 font-medium">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-gray-100">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-md bg-white rounded-2xl p-12 shadow-lg"
                >
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HiOutlineShoppingBag className="text-6xl text-gray-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Your Cart is Empty</h1>
                    <p className="text-gray-500 mt-3">Looks like you haven't added anything yet.</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 mt-8 bg-red-500 text-white px-8 py-4 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg"
                    >
                        <HiArrowLeft />
                        Start Shopping
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* 🔥 Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Shopping Cart
                        </h1>
                        <span className="text-base sm:text-lg text-gray-500 bg-white px-4 py-1.5 rounded-full border border-gray-200">
                            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                    <Link
                        href="/shop"
                        className="text-base text-[#007185] hover:text-[#C7511F] hover:underline transition font-medium"
                    >
                        ← Continue Shopping
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* 🔥 Left: Cart Items (2/3) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Select All Bar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <button
                                onClick={toggleSelectAll}
                                className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-black transition"
                            >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isAllSelected
                                        ? 'bg-red-500 border-red-500'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}>
                                    {isAllSelected && <HiCheck className="text-white text-sm" />}
                                </div>
                                Select All ({totalQuantity} items)
                            </button>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                    {selectedQuantity} selected
                                </span>
                                {selectedItems.size > 0 && (
                                    <button
                                        onClick={handleRemoveSelected}
                                        className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline transition font-medium"
                                    >
                                        Delete selected
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 🔥 Cart Items */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {cart.map((item: CartItem) => {
                                    const isSelected = selectedItems.has(item.id);
                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                    const deliveryCharge = item.deliveryCharge ?? 0;
                                    const isFreeDelivery = deliveryCharge === 0;
                                    const itemTotal = price * item.quantity;
                                    const isUpdating = updatingId === item.id;
                                    const isLowStock = item.stock < 5;
                                    const isVeryLowStock = item.stock <= 1;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.3 }}
                                            className={`bg-white rounded-xl border-2 transition-all duration-300 shadow-sm ${isSelected
                                                    ? 'border-red-500 shadow-md shadow-red-500/10'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="p-5">
                                                <div className="flex gap-4">
                                                    {/* Select Checkbox */}
                                                    <button
                                                        onClick={() => toggleItem(item.id)}
                                                        className="mt-1 shrink-0"
                                                    >
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isSelected
                                                                ? 'bg-red-500 border-red-500'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                            }`}>
                                                            {isSelected && <HiCheck className="text-white text-sm" />}
                                                        </div>
                                                    </button>

                                                    {/* Product Image */}
                                                    <Link href={`/shop/${item.productId}`} className="shrink-0">
                                                        <img
                                                            src={item.image || "/placeholder.png"}
                                                            alt={item.name}
                                                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-gray-50 border border-gray-100"
                                                        />
                                                    </Link>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <Link href={`/shop/${item.productId}`}>
                                                            <h3 className="text-lg sm:text-xl font-semibold text-[#007185] hover:text-[#C7511F] hover:underline transition">
                                                                {item.name}
                                                            </h3>
                                                        </Link>

                                                        {/* Product Info */}
                                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                                            <span className="text-sm text-gray-600 font-medium">
                                                                {item.color} | {item.size}
                                                            </span>
                                                            {item.isOnSale && (
                                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                                                    SALE
                                                                </span>
                                                            )}
                                                            {isFreeDelivery ? (
                                                                <span className="text-sm text-green-600 font-medium flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                                                                    <FaTruck className="text-sm" />
                                                                    FREE Delivery
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-orange-600 font-medium flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full">
                                                                    <FaTruck className="text-sm" />
                                                                    Delivery: Rs. {deliveryCharge}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Stock Warning */}
                                                        {isVeryLowStock && (
                                                            <div className="flex items-center gap-2 mt-2 bg-red-50 px-3 py-1.5 rounded-lg">
                                                                <FaFire className="text-red-500 text-sm" />
                                                                <p className="text-sm font-bold text-red-600">
                                                                    Only {item.stock} left in stock - order soon!
                                                                </p>
                                                            </div>
                                                        )}
                                                        {isLowStock && !isVeryLowStock && (
                                                            <p className="text-sm text-orange-600 font-medium mt-2">
                                                                Only {item.stock} left in stock
                                                            </p>
                                                        )}

                                                        {/* Price */}
                                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                                            {item.isOnSale ? (
                                                                <>
                                                                    <span className="text-2xl font-bold text-red-600">
                                                                        Rs. {price.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-base text-gray-400 line-through">
                                                                        Rs. {item.price.toLocaleString()}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-2xl font-bold text-gray-900">
                                                                    Rs. {price.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Bottom Controls */}
                                                        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                                                            {/* Quantity */}
                                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                                <button
                                                                    onClick={() => handleDecreaseQty(item.id)}
                                                                    disabled={isUpdating || item.quantity <= 1}
                                                                    className="w-10 h-10 sm:w-11 sm:h-11 hover:bg-gray-100 flex items-center justify-center transition disabled:opacity-40 text-lg"
                                                                >
                                                                    <HiOutlineMinus className="text-lg" />
                                                                </button>

                                                                <div className="w-12 sm:w-14 text-center text-lg font-bold">
                                                                    {isUpdating ? (
                                                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                                    ) : (
                                                                        item.quantity
                                                                    )}
                                                                </div>

                                                                <button
                                                                    onClick={() => handleIncreaseQty(item.id)}
                                                                    disabled={isUpdating || item.quantity >= item.stock}
                                                                    className="w-10 h-10 sm:w-11 sm:h-11 hover:bg-gray-100 flex items-center justify-center transition disabled:opacity-40 text-lg"
                                                                >
                                                                    <HiOutlinePlus className="text-lg" />
                                                                </button>
                                                            </div>

                                                            {/* Item Total */}
                                                            <span className="text-base font-semibold text-gray-800">
                                                                Total: <span className="text-red-600">Rs. {itemTotal.toLocaleString()}</span>
                                                            </span>

                                                            {/* Delete */}
                                                            <button
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline transition font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Trust Badges */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <FaShieldAlt className="text-xl text-green-600" />
                                    <span className="font-medium">Secure Checkout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-xl text-blue-600" />
                                    <span className="font-medium">Fast Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaTag className="text-xl text-purple-600" />
                                    <span className="font-medium">Best Prices</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaGift className="text-xl text-orange-600" />
                                    <span className="font-medium">Free Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🔥 Right: Order Summary (1/3) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-lg p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>

                            {!hasSelected ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-base">Select items to checkout</p>
                                </div>
                            ) : (
                                <>
                                    {/* Free Delivery Items */}
                                    {freeDeliveryItems.length > 0 && (
                                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                            <div className="flex items-center gap-2 text-base font-semibold text-green-700 mb-2">
                                                <FaGift className="text-green-600 text-lg" />
                                                Free Delivery Items
                                                <span className="text-sm font-normal text-green-500 bg-green-100 px-2.5 py-0.5 rounded-full">
                                                    {freeDeliveryItems.reduce((sum, item) => sum + item.quantity, 0)} items
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {freeDeliveryItems.map((item: CartItem) => {
                                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                                    return (
                                                        <div key={item.id} className="flex justify-between text-base">
                                                            <span className="text-gray-600 truncate">
                                                                {item.name} <span className="text-gray-400">× {item.quantity}</span>
                                                            </span>
                                                            <span className="font-semibold text-green-700">
                                                                Rs. {(price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                <div className="flex justify-between text-base font-bold pt-2 border-t border-green-200">
                                                    <span>Subtotal</span>
                                                    <span className="text-green-700">Rs. {freeDeliverySubtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-base text-green-600">
                                                    <span>Delivery</span>
                                                    <span className="font-bold">FREE</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Paid Delivery Items */}
                                    {paidDeliveryItems.length > 0 && (
                                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                            <div className="flex items-center gap-2 text-base font-semibold text-orange-700 mb-2">
                                                <FaTruck className="text-orange-600 text-lg" />
                                                Standard Delivery Items
                                                <span className="text-sm font-normal text-orange-500 bg-orange-100 px-2.5 py-0.5 rounded-full">
                                                    {paidDeliveryItems.reduce((sum, item) => sum + item.quantity, 0)} items
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {paidDeliveryItems.map((item: CartItem) => {
                                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                                    const itemDelivery = item.deliveryCharge ?? 0;
                                                    return (
                                                        <div key={item.id}>
                                                            <div className="flex justify-between text-base">
                                                                <span className="text-gray-600 truncate">
                                                                    {item.name} <span className="text-gray-400">× {item.quantity}</span>
                                                                </span>
                                                                <span className="font-semibold">
                                                                    Rs. {(price * item.quantity).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm text-gray-400 pl-2">
                                                                <span>Delivery: Rs. {item.deliveryCharge}</span>
                                                                <span>Rs. {itemDelivery.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div className="flex justify-between text-base font-bold pt-2 border-t border-orange-200">
                                                    <span>Subtotal</span>
                                                    <span className="text-orange-700">Rs. {paidDeliverySubtotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <hr className="border-gray-200" />

                                    {/* Grand Total Breakdown */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-base">
                                            <span className="text-gray-600">Items Subtotal</span>
                                            <span className="font-semibold">Rs. {itemsSubtotal.toLocaleString()}</span>
                                        </div>

                                        {hasDeliveryCharge && (
                                            <div className="flex justify-between text-base">
                                                <span className="text-gray-600">Total Delivery</span>
                                                <span className="font-semibold text-orange-600">Rs. {totalDeliveryCharge.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <hr className="border-gray-200" />

                                    {/* Grand Total */}
                                    <div className="flex justify-between text-2xl font-bold">
                                        <span>Grand Total</span>
                                        <span className="text-red-600">Rs. {grandTotal.toLocaleString()}</span>
                                    </div>

                                    {/* Delivery Charges Breakdown */}
                                    {hasDeliveryCharge && (
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                            <p className="text-sm font-semibold text-gray-600 mb-1.5">Delivery Charges Breakdown</p>
                                            <div className="space-y-1">
                                                {deliveryBreakdown.map((item) => (
                                                    <div key={item.name} className="flex justify-between text-sm text-gray-600">
                                                        <span>
                                                            {item.name}
                                                            <span className="text-gray-400 ml-1">(×{item.quantity})</span>
                                                        </span>
                                                        <span className="font-medium">Rs. {item.charge}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-200 text-gray-800">
                                                                    <span>Total Delivery</span>
                                                    <span>Rs. {totalDeliveryCharge.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 🔥 CHECKOUT BUTTON */}
                                    <div className="pt-2">
                                        <button
                                            disabled={!hasSelected}
                                            onClick={() => {
                                                if (!hasSelected) return;
                                                const ids = Array.from(selectedItems).join(",");
                                                router.push(`/checkout?items=${ids}`);
                                            }}
                                            className={`
                        w-full py-4 rounded-xl text-center font-bold text-white text-lg 
                        transition-all duration-300 flex items-center justify-center gap-3
                        ${hasSelected
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]'
                                                    : 'bg-gray-300 cursor-not-allowed'
                                                }
                      `}
                                        >
                                            <span>🛒 Proceed to Checkout</span>
                                            <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm font-semibold">
                                                {selectedQuantity} {selectedQuantity === 1 ? 'item' : 'items'}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-base text-gray-500 font-medium">Secure payments with</span>
                                            <div className="flex items-center gap-3">
                                                <SiVisa className="text-2xl text-[#1A1F71]" />
                                                <SiMastercard className="text-2xl text-[#EB001B]" />
                                                <SiDiscover className="text-2xl text-[#FF6000]" />
                                                <SiAmericanexpress className="text-2xl text-[#006FCF]" />
                                            </div>
                                        </div>
                                        <div className="text-center text-sm text-gray-400">
                                            <span>🔒 Your payment is secure</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}