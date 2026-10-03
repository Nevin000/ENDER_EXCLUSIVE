"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  isOnSale?: boolean;
  category?: string;
  addedAt?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  addToWishlist: async () => { },
  removeFromWishlist: async () => { },
  isInWishlist: () => false,
  toggleWishlist: async () => { },
  clearWishlist: async () => { },
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from Firestore (strictly bound to user.uid) or user-isolated LocalStorage
  useEffect(() => {
    let isCancelled = false;

    const loadWishlist = async () => {
      if (!user) {
        // Guest user — load from guest-isolated LocalStorage
        const localData = localStorage.getItem("ender_wishlist_guest");
        if (!isCancelled) {
          if (localData) {
            try {
              setWishlist(JSON.parse(localData));
            } catch {
              setWishlist([]);
            }
          } else {
            setWishlist([]);
          }
        }
        return;
      }

      // Logged in user — load from Firestore `wishlist/{user.uid}`
      try {
        const wishlistRef = doc(db, "wishlist", user.uid);
        const snap = await getDoc(wishlistRef);

        if (snap.exists() && Array.isArray(snap.data().items)) {
          const items = snap.data().items;
          if (!isCancelled) {
            setWishlist(items);
            localStorage.setItem(`ender_wishlist_${user.uid}`, JSON.stringify(items));
          }
          return;
        }

        // Check user-isolated localStorage key fallback
        const userLocal = localStorage.getItem(`ender_wishlist_${user.uid}`);
        if (userLocal) {
          try {
            const parsed = JSON.parse(userLocal);
            if (!isCancelled) setWishlist(parsed);
            await setDoc(wishlistRef, { userId: user.uid, items: parsed, updatedAt: new Date().toISOString() }, { merge: true });
            return;
          } catch { }
        }

        if (!isCancelled) setWishlist([]);
      } catch (e) {
        // Fallback gracefully to user-isolated localStorage if Firestore is offline or unauthenticated
        const userLocal = localStorage.getItem(`ender_wishlist_${user.uid}`);
        if (userLocal && !isCancelled) {
          try {
            setWishlist(JSON.parse(userLocal));
          } catch {
            setWishlist([]);
          }
        } else if (!isCancelled) {
          setWishlist([]);
        }
      }
    };

    loadWishlist();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Save helper — strictly bound to current user.uid
  const saveWishlist = async (newList: WishlistItem[]) => {
    setWishlist(newList);

    if (user) {
      const userKey = `ender_wishlist_${user.uid}`;
      localStorage.setItem(userKey, JSON.stringify(newList));

      try {
        const wishlistRef = doc(db, "wishlist", user.uid);
        await setDoc(wishlistRef, { userId: user.uid, items: newList, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (e) {
        // Fallback silently to user-isolated localStorage
      }
    } else {
      localStorage.setItem("ender_wishlist_guest", JSON.stringify(newList));
    }
  };

  const addToWishlist = async (item: WishlistItem) => {
    if (wishlist.some((i) => i.productId === item.productId)) return;
    const itemToAdd = { ...item, addedAt: new Date().toISOString() };
    const newList = [...wishlist, itemToAdd];
    await saveWishlist(newList);
  };

  const removeFromWishlist = async (productId: string) => {
    const newList = wishlist.filter((i) => i.productId !== productId);
    await saveWishlist(newList);
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((i) => i.productId === productId);
  };

  const toggleWishlist = async (item: WishlistItem) => {
    if (isInWishlist(item.productId)) {
      await removeFromWishlist(item.productId);
    } else {
      await addToWishlist(item);
    }
  };

  const clearWishlist = async () => {
    await saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
