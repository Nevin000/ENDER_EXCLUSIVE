"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

const ROLE_CACHE_KEY = "ender_user_role";
const ROLE_CACHE_UID_KEY = "ender_user_uid";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 🔥 Pre-load cached role so pages render instantly without waiting for Firestore
  const getCachedRole = () => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(ROLE_CACHE_KEY);
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(getCachedRole);
  const [loading, setLoading] = useState(true);

  const fetchAndCacheRole = useCallback(async (currentUser: User) => {
    // 🔥 If same user and role is already cached, skip Firestore fetch
    try {
      const cachedUid = sessionStorage.getItem(ROLE_CACHE_UID_KEY);
      const cachedRole = sessionStorage.getItem(ROLE_CACHE_KEY);
      if (cachedUid === currentUser.uid && cachedRole) {
        setRole(cachedRole);
        return;
      }
    } catch {
      // sessionStorage not available
    }

    // 🔥 Fetch from Firestore only when needed
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const fetchedRole = userSnap.exists() ? userSnap.data().role : "user";
      setRole(fetchedRole);

      // Cache it for this session
      try {
        sessionStorage.setItem(ROLE_CACHE_KEY, fetchedRole);
        sessionStorage.setItem(ROLE_CACHE_UID_KEY, currentUser.uid);
      } catch {
        // sessionStorage not available
      }
    } catch (error) {
      console.error("Error loading user role:", error);
      setRole("user");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchAndCacheRole(currentUser);
      } else {
        setRole(null);
        // Clear cache on logout
        try {
          sessionStorage.removeItem(ROLE_CACHE_KEY);
          sessionStorage.removeItem(ROLE_CACHE_UID_KEY);
        } catch {
          // ignore
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAndCacheRole]);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
