"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { CartItem } from "@/types/cart";
import {
    getCartItems,
    addToCart,
    removeCartItem,
    updateCartQuantity,
} from "@/services/cartService";

interface CartContextType {
    cart: CartItem[];
    loading: boolean;
    cartCount: number;
    loadCart: () => Promise<void>;
    addItem: (item: Omit<CartItem, "id">) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    increaseQty: (id: string) => Promise<void>;
    decreaseQty: (id: string) => Promise<void>;
    clearCart: () => void;
    getItemCount: (productId: string, color: string, size: string) => number;
    getTotalItems: () => number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false); // 🔥 Start false — no blocking spinner
    const [isUpdating, setIsUpdating] = useState(false);

    // 🔥 Load cart from Firestore
    const loadCart = useCallback(async () => {
        if (!user) {
            setCart([]);
            return;
        }
        try {
            setLoading(true);
            const items = await getCartItems(user.uid);
            setCart(items);
        } catch (err) {
            console.error("Error loading cart:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 🔥 Load cart when user changes
    useEffect(() => {
        loadCart();
    }, [loadCart]);

    // 🔥 Add item — optimistic update, no full refetch
    const addItem = async (item: Omit<CartItem, "id">) => {
        if (!user) throw new Error("Please login to add items to cart");
        if (!item.productId || !item.color || !item.size) throw new Error("Product ID, color, and size are required");
        if (item.quantity <= 0) throw new Error("Quantity must be greater than 0");
        if (isUpdating) return;

        setIsUpdating(true);
        try {
            const exists = cart.find(
                (c) => c.productId === item.productId && c.color === item.color && c.size === item.size
            );

            if (exists) {
                const newQuantity = exists.quantity + item.quantity;
                if (newQuantity > exists.stock) throw new Error(`Only ${exists.stock} items available in stock`);

                await updateCartQuantity(exists.id, newQuantity);
                // 🔥 Optimistic update — no full Firestore refetch
                setCart((prev) =>
                    prev.map((c) => c.id === exists.id ? { ...c, quantity: newQuantity } : c)
                );
            } else {
                const cartItem = {
                    ...item,
                    userId: user.uid,
                    deliveryCharge: item.deliveryCharge ?? 0,
                    createdAt: new Date().toISOString(),
                };
                const newId = await addToCart(cartItem);
                // 🔥 Optimistic update — append new item to local state
                setCart((prev) => [...prev, { ...cartItem, id: newId }]);
            }
        } catch (error) {
            // On error, re-sync with Firestore to ensure consistency
            await loadCart();
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    // 🔥 Remove item — optimistic update
    const removeItem = async (id: string) => {
        if (!id || isUpdating) return;
        setIsUpdating(true);
        // Optimistically remove from local state immediately
        const previousCart = cart;
        setCart((prev) => prev.filter((c) => c.id !== id));
        try {
            await removeCartItem(id);
        } catch (error) {
            // Rollback on error
            setCart(previousCart);
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    // 🔥 Increase quantity — optimistic update
    const increaseQty = async (id: string) => {
        if (!id || isUpdating) return;
        const item = cart.find((c) => c.id === id);
        if (!item) return;
        if (item.quantity >= item.stock) {
            alert(`Only ${item.stock} items available in stock`);
            return;
        }
        setIsUpdating(true);
        const newQty = item.quantity + 1;
        setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: newQty } : c));
        try {
            await updateCartQuantity(id, newQty);
        } catch (error) {
            // Rollback
            setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: item.quantity } : c));
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    // 🔥 Decrease quantity — optimistic update
    const decreaseQty = async (id: string) => {
        if (!id || isUpdating) return;
        const item = cart.find((c) => c.id === id);
        if (!item) return;
        if (item.quantity <= 1) {
            await removeItem(id);
            return;
        }
        setIsUpdating(true);
        const newQty = item.quantity - 1;
        setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: newQty } : c));
        try {
            await updateCartQuantity(id, newQty);
        } catch (error) {
            // Rollback
            setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: item.quantity } : c));
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    // 🔥 Clear cart (local only — called after order placed)
    const clearCart = () => setCart([]);

    const getItemCount = (productId: string, color: string, size: string) => {
        return cart.find((c) => c.productId === productId && c.color === color && c.size === size)?.quantity || 0;
    };

    const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                cartCount,
                loadCart,
                addItem,
                removeItem,
                increaseQty,
                decreaseQty,
                clearCart,
                getItemCount,
                getTotalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);