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
import { auth } from "@/firebase/config";
import { fetchUserRecord, UserRecord } from "@/lib/authService";

// ─── Types ────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  record: UserRecord | null;
  role: string | null;
  status: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

// ─── Context ──────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  record: null,
  role: null,
  status: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isUser: false,
});

// ─── Provider ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [record, setRecord] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadRecord = useCallback(async (currentUser: User) => {
    const userRecord = await fetchUserRecord(currentUser.uid);
    if (isMounted.current) {
      setRecord(userRecord);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted.current) return;

      setUser(currentUser);

      if (currentUser) {
        await loadRecord(currentUser);
      } else {
        setRecord(null);
      }

      if (isMounted.current) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadRecord]);

  const role = record?.role ?? null;
  const status = record?.status ?? null;
  const isAuthenticated = !!user;
  const isAdmin = role === "admin";
  const isUser = role === "user";

  return (
    <AuthContext.Provider
      value={{ user, record, role, status, loading, isAuthenticated, isAdmin, isUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────

export const useAuth = () => useContext(AuthContext);
