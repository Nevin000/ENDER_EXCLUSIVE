"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
  toggleWishlist: async () => {},
  clearWishlist: async () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage or Firestore on mount / user change
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists() && snap.data().wishlist) {
            setWishlist(snap.data().wishlist);
            return;
          }
        } catch (e) {
          console.error("Error fetching wishlist from Firestore:", e);
        }
      }

      // Fallback to LocalStorage
      const localData = localStorage.getItem("ender_wishlist");
      if (localData) {
        try {
          setWishlist(JSON.parse(localData));
        } catch (e) {
          console.error("Error parsing local wishlist:", e);
        }
      }
    };

    loadWishlist();
  }, [user]);

  // Persist helper
  const saveWishlist = async (newList: WishlistItem[]) => {
    setWishlist(newList);
    localStorage.setItem("ender_wishlist", JSON.stringify(newList));

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { wishlist: newList }, { merge: true });
      } catch (e) {
        console.error("Error saving wishlist to Firestore:", e);
      }
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
