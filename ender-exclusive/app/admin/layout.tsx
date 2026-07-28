"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminAuthProvider>
      {isLoginPage ? (
        <>{children}</>
      ) : (
        <AdminGuard>
          <div className="flex flex-col lg:flex-row bg-zinc-100 dark:bg-[#0A0A0A] min-h-screen">
            <AdminSidebar />
            <main className="flex-1 overflow-x-hidden min-w-0">{children}</main>
          </div>
        </AdminGuard>
      )}
    </AdminAuthProvider>
  );
}

