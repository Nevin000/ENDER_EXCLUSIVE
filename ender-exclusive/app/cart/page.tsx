"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

import {
    HiOutlineShoppingBag,
    HiOutlineMinus,
    HiOutlinePlus,
    HiArrowLeft,
    HiCheck,
} from "react-icons/hi2";
import { FaTruck, FaShieldAlt, FaClock, FaFire, FaGift, FaTag } from "react-icons/fa";
import { Flame, Sparkles, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";

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

    // Delivery charge - ONE TIME PER PRODUCT
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

    // Delivery Breakdown - Group by productId
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
    const handleRemoveItem = async (id: string) => {
        if (confirm("Remove this product from your cart?")) {
            await removeItem(id);
        }
    };

    // Remove all selected items
    const handleRemoveSelected = async () => {
        if (selectedItems.size === 0) return;
        if (confirm(`Remove ${selectedItems.size} selected items?`)) {
            const ids = Array.from(selectedItems);
            setSelectedItems(new Set());
            for (const id of ids) {
                await removeItem(id);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300">
                <div className="text-center space-y-4">
                    <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-black uppercase tracking-widest text-red-500">
                        Loading Your Cart...
                    </p>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-lg bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 sm:p-14 shadow-lg space-y-6"
                >
                    <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <ShoppingBag className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black uppercase tracking-tight">Your Cart is Empty</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                            Looks like you haven't added any gear to your cart yet. Explore our high-performance apparel and signature streetwear.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link
                            href="/shop"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 shadow-xl hover:scale-105"
                        >
                            <ArrowRight className="w-4 h-4" />
                            <span>Explore Store Catalog</span>
                        </Link>
                        <Link
                            href="/on-sale"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-full transition"
                        >
                            <Flame className="w-4 h-4 text-red-500" />
                            <span>Flash Sale Deals</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300 py-8 sm:py-12 lg:py-16 pb-28">
            <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* ===== HEADER BAR ===== */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight">
                            Shopping <span className="text-red-600 dark:text-red-500">Cart</span>
                        </h1>
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-red-600 px-4 py-1.5 rounded-full shadow-md">
                            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 transition"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        <span>Continue Shopping</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">

                    {/* ===== LEFT: CART ITEMS (2/3) ===== */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Select All & Bulk Controls Bar */}
                        <div className="bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                            <button
                                onClick={toggleSelectAll}
                                className="flex items-center gap-3.5 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition cursor-pointer"
                            >
                                <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition ${isAllSelected
                                    ? 'bg-red-600 border-red-600 text-white'
                                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#181818]'
                                    }`}>
                                    {isAllSelected && <HiCheck className="text-white text-base stroke-[3]" />}
                                </div>
                                <span>Select All Items ({totalQuantity})</span>
                            </button>

                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                                    {selectedQuantity} Selected
                                </span>
                                {selectedItems.size > 0 && (
                                    <button
                                        onClick={handleRemoveSelected}
                                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-500 hover:underline transition cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete Selected ({selectedItems.size})</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Cart Product List */}
                        <div className="space-y-5">
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
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            className={`bg-zinc-50/80 dark:bg-[#111111] rounded-3xl border-2 transition-all duration-300 shadow-sm overflow-hidden ${isSelected
                                                ? 'border-red-600 dark:border-red-500/80 shadow-red-500/10'
                                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                }`}
                                        >
                                            <div className="p-6 sm:p-7">
                                                <div className="flex items-start gap-4 sm:gap-6">

                                                    {/* Selection Checkbox */}
                                                    <button
                                                        onClick={() => toggleItem(item.id)}
                                                        className="mt-2 shrink-0 cursor-pointer"
                                                        aria-label="Select item"
                                                    >
                                                        <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition ${isSelected
                                                            ? 'bg-red-600 border-red-600 text-white'
                                                            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#181818]'
                                                            }`}>
                                                            {isSelected && <HiCheck className="text-white text-base stroke-[3]" />}
                                                        </div>
                                                    </button>

                                                    {/* Product Image */}
                                                    <Link
                                                        href={item.isOnSale ? `/on-sale/${item.productId}` : `/shop/${item.productId}`}
                                                        className="shrink-0 relative group"
                                                    >
                                                        <img
                                                            src={item.image || "/lookbook/look_book_banner.avif"}
                                                            alt={item.name}
                                                            className="w-28 h-32 sm:w-36 sm:h-40 rounded-2xl object-cover bg-zinc-100 dark:bg-[#1A1A1A] border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </Link>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        <Link
                                                            href={item.isOnSale ? `/on-sale/${item.productId}` : `/shop/${item.productId}`}
                                                        >
                                                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition line-clamp-2 leading-snug">
                                                                {item.name}
                                                            </h3>
                                                        </Link>

                                                        {/* Specs & Delivery Pills */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 dark:bg-zinc-800 px-3.5 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700">
                                                                Color: {item.color} • Size: {item.size}
                                                            </span>

                                                            {item.isOnSale && (
                                                                <span className="text-[11px] font-black uppercase tracking-wider text-white bg-red-600 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                                                                    <Flame className="w-3 h-3 fill-white" />
                                                                    SALE
                                                                </span>
                                                            )}

                                                            {isFreeDelivery ? (
                                                                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                                                                    <FaTruck className="text-xs" />
                                                                    FREE Delivery
                                                                </span>
                                                            ) : (
                                                                <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20 flex items-center gap-1.5">
                                                                    <FaTruck className="text-xs" />
                                                                    Delivery: Rs. {deliveryCharge}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Stock Notice */}
                                                        {isVeryLowStock && (
                                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold">
                                                                <FaFire className="text-xs" />
                                                                <span>Only {item.stock} left in stock - order soon!</span>
                                                            </div>
                                                        )}
                                                        {isLowStock && !isVeryLowStock && (
                                                            <p className="text-xs text-amber-500 font-bold">
                                                                Only {item.stock} left in stock
                                                            </p>
                                                        )}

                                                        {/* Unit Price */}
                                                        <div className="flex items-baseline gap-3 pt-1">
                                                            <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-500">
                                                                Rs. {price.toLocaleString()}
                                                            </span>
                                                            {item.isOnSale && item.price && (
                                                                <span className="text-xs font-semibold text-zinc-400 line-through">
                                                                    Rs. {item.price.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Controls Bar */}
                                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">

                                                            {/* Quantity Selector */}
                                                            <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-2xl overflow-hidden bg-white dark:bg-[#181818] shadow-sm">
                                                                <button
                                                                    onClick={() => handleDecreaseQty(item.id)}
                                                                    disabled={isUpdating || item.quantity <= 1}
                                                                    className="w-10 h-10 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition disabled:opacity-40 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                                                                >
                                                                    <HiOutlineMinus className="text-base" />
                                                                </button>

                                                                <div className="w-12 text-center text-sm font-black text-zinc-900 dark:text-white">
                                                                    {isUpdating ? (
                                                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                                    ) : (
                                                                        item.quantity
                                                                    )}
                                                                </div>

                                                                <button
                                                                    onClick={() => handleIncreaseQty(item.id)}
                                                                    disabled={isUpdating || item.quantity >= item.stock}
                                                                    className="w-10 h-10 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition disabled:opacity-40 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                                                                >
                                                                    <HiOutlinePlus className="text-base" />
                                                                </button>
                                                            </div>

                                                            {/* Item Total & Remove */}
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Total</span>
                                                                    <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                                                                        Rs. {itemTotal.toLocaleString()}
                                                                    </span>
                                                                </div>

                                                                <button
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition cursor-pointer"
                                                                    title="Remove from Cart"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Customer Trust Badges Bar */}
                        <div className="bg-zinc-50 dark:bg-[#111111] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                <div className="flex flex-col items-center gap-2 p-2">
                                    <FaShieldAlt className="text-2xl text-emerald-500" />
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-2">
                                    <FaClock className="text-2xl text-amber-500" />
                                    <span>Islandwide Dispatch</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-2">
                                    <FaTag className="text-2xl text-red-500" />
                                    <span>Best Price Guarantee</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-2">
                                    <FaGift className="text-2xl text-blue-500" />
                                    <span>Authentic Quality</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ===== RIGHT: ORDER SUMMARY (1/3) ===== */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-zinc-50 dark:bg-[#111111] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-7 sm:p-8 space-y-6">

                            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                                    Order Summary
                                </h2>
                                <span className="text-xs font-black text-amber-500 uppercase tracking-widest">
                                    {selectedQuantity} {selectedQuantity === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>

                            {!hasSelected ? (
                                <div className="text-center py-10 space-y-2">
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                        Select at least 1 item from your cart to proceed to checkout.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Free Delivery Items Subtotal */}
                                    {freeDeliveryItems.length > 0 && (
                                        <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 space-y-2">
                                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                <div className="flex items-center gap-2">
                                                    <FaGift className="text-sm" />
                                                    <span>Free Delivery Items</span>
                                                </div>
                                                <span>{freeDeliveryItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold pt-1 border-t border-emerald-500/20">
                                                <span>Items Total</span>
                                                <span className="text-emerald-600 dark:text-emerald-400">
                                                    Rs. {freeDeliverySubtotal.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Standard Delivery Items Subtotal */}
                                    {paidDeliveryItems.length > 0 && (
                                        <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 space-y-2">
                                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                                <div className="flex items-center gap-2">
                                                    <FaTruck className="text-sm" />
                                                    <span>Standard Delivery Items</span>
                                                </div>
                                                <span>{paidDeliveryItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold pt-1 border-t border-amber-500/20">
                                                <span>Items Total</span>
                                                <span className="text-amber-600 dark:text-amber-400">
                                                    Rs. {paidDeliverySubtotal.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items Subtotal & Delivery Total */}
                                    <div className="space-y-3 text-sm font-bold pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                            <span>Items Subtotal</span>
                                            <span className="text-zinc-900 dark:text-white font-black">
                                                Rs. {itemsSubtotal.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                            <span>Total Delivery Charge</span>
                                            <span className="font-black text-amber-500">
                                                {totalDeliveryCharge === 0 ? "FREE" : `Rs. ${totalDeliveryCharge.toLocaleString()}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delivery Breakdown List */}
                                    {hasDeliveryCharge && (
                                        <div className="bg-zinc-100 dark:bg-[#181818] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                            <p className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                Delivery Breakdown
                                            </p>
                                            <div className="space-y-1.5 text-xs">
                                                {deliveryBreakdown.map((item) => (
                                                    <div key={item.name} className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                                        <span className="truncate max-w-[170px]">
                                                            {item.name} <span className="text-zinc-400">(×{item.quantity})</span>
                                                        </span>
                                                        <span className="font-bold text-zinc-900 dark:text-white">Rs. {item.charge}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Grand Total */}
                                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-baseline justify-between">
                                        <span className="text-base font-black uppercase tracking-wider">Grand Total</span>
                                        <span className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-500">
                                            Rs. {grandTotal.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* PROCEED TO CHECKOUT BUTTON */}
                                    <div className="pt-2">
                                        <button
                                            disabled={!hasSelected}
                                            onClick={() => {
                                                if (!hasSelected) return;
                                                const ids = Array.from(selectedItems).join(",");
                                                router.push(`/checkout?items=${ids}`);
                                            }}
                                            className={`
                                                w-full py-4 sm:py-5 rounded-2xl text-center font-black text-white text-base sm:text-lg 
                                                uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-xl
                                                ${hasSelected
                                                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]'
                                                    : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            <ShoppingBag className="w-5 h-5" />
                                            <span>Proceed to Checkout</span>
                                        </button>
                                    </div>

                                    {/* Secure Checkout Notice */}
                                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-center">
                                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                            🔒 100% Encrypted & Secure Checkout
                                        </p>
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