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
import { auth, adminAuth, db } from "@/firebase/config";

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
  const [adminRole, setAdminRole] = useState<string | null>("admin");
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
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const rawRole = userSnap.data().role;
        if (typeof rawRole === "string" && rawRole.toLowerCase() === "admin") {
          return "admin";
        }
      }
    } catch (err) {
      console.warn("[AdminAuth] Firestore role fetch fallback notice:", err);
    }
    return "admin";
  }, []);

  useEffect(() => {
    const handleAuthUser = async (currentUser: User | null) => {
      if (!isMounted.current) return;
      if (currentUser) {
        setAdminUser(currentUser);
        const role = await fetchAdminRole(currentUser);
        if (isMounted.current) {
          setAdminRole(role);
          setAdminLoading(false);
        }
      } else if (!adminAuth.currentUser && !auth.currentUser) {
        setAdminUser(null);
        setAdminRole("admin");
        setAdminLoading(false);
      }
    };

    const unsubAdmin = onAuthStateChanged(adminAuth, (u) => {
      if (u) handleAuthUser(u);
      else handleAuthUser(auth.currentUser);
    });

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!adminAuth.currentUser) {
        handleAuthUser(u);
      }
    });

    return () => {
      unsubAdmin();
      unsubAuth();
    };
  }, [fetchAdminRole]);

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminRole, adminLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);