"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (role && role !== "admin") {
        // Logged-in regular user tried to access admin — send them home
        router.replace("/");
      }
    }
  }, [user, role, loading, router]);

  // Show spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Block render until we confirm role is admin
  if (!user || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-zinc-100 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
