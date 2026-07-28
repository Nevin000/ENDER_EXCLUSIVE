"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { adminUser, adminRole, adminLoading } = useAdminAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (!adminLoading && !adminUser && !redirected.current) {
      redirected.current = true;
      router.replace("/admin/login");
    }
    if (!adminLoading && adminUser && adminRole !== null && adminRole !== "admin" && !redirected.current) {
      redirected.current = true;
      router.replace("/admin/login");
    }
  }, [adminUser, adminRole, adminLoading, router]);

  // Show spinner while auth state is loading
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  // Block render until confirmed admin
  if (!adminUser || adminRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
            Redirecting to Admin Login...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
