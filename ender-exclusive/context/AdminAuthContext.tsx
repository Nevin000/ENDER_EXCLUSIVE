"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { adminAuth, db } from "@/firebase/config";

interface AdminAuthContextType {
  adminUser: User | null;
  adminRole: string | null;
  adminLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUser: null,
  adminRole: null,
  adminLoading: true,
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAdminRole = useCallback(async (currentUser: User): Promise<string> => {
    try {
      // Always fetch fresh from Firestore via customer db (shared rules, same project)
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return (userSnap.data().role as string) || "user";
      }
    } catch (err) {
      console.error("[AdminAuth] Firestore role fetch error:", err);
    }
    return "user";
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (currentUser) => {
      if (!isMounted.current) return;

      if (currentUser) {
        setAdminUser(currentUser);
        const role = await fetchAdminRole(currentUser);
        if (isMounted.current) {
          setAdminRole(role);
          setAdminLoading(false);
        }
      } else {
        setAdminUser(null);
        setAdminRole(null);
        setAdminLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchAdminRole]);

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminRole, adminLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
