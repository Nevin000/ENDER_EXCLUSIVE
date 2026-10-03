// components/AdminShell.tsx
"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthProvider>
            <div className="admin-font-override min-h-screen">
                <div className="flex flex-col lg:flex-row bg-zinc-100 dark:bg-[#0A0A0A] min-h-screen">
                    <AdminSidebar />
                    <main className="flex-1 overflow-x-hidden min-w-0">{children}</main>
                </div>
            </div>
        </AdminAuthProvider>
    );
}