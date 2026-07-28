"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, LogIn } from "lucide-react";

/**
 * CustomerAccountGuard
 *
 * Protects: /cart, /checkout, /orders, /profile, /wishlist
 *
 * - Unauthenticated guest → redirect to /login
 * - Admin attempting to access customer pages → show block screen (do NOT redirect to admin)
 * - Active customer user → render children
 */
export default function CustomerAccountGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, status, loading } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (!loading && !user && !redirected.current) {
      redirected.current = true;
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Unauthenticated guest - redirect in progress
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Admin attempting to access customer account pages
  if (role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-200 shadow-xl p-10 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Session Active</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            You are currently signed in as an <strong>Administrator</strong>. 
            Customer account pages (Cart, Orders, Profile) are not accessible from an Admin account.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm rounded-xl hover:bg-zinc-800 transition"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Suspended / banned account
  if (status && status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 shadow-xl p-10 text-center space-y-4">
          <h1 className="text-2xl font-black text-gray-900">Account Suspended</h1>
          <p className="text-gray-600 text-sm">
            Your account has been suspended. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated customer user with active status
  return <>{children}</>;
}
