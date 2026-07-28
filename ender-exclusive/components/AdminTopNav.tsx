"use client";

import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineBellAlert,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function AdminTopNav({
  isSidebarCollapsed,
  setSidebarCollapsed,
}: {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { adminUser } = useAdminAuth();
  
  const [isDark, setIsDark] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Toggle Theme (Simple documentElement class toggle)
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  // Live Low Stock Alerts for Notifications
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      let count = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        if ((data.stock || 0) <= 5) count++;
      });
      setLowStockCount(count);
    });
    return () => unsub();
  }, []);

  // Breadcrumbs formatting
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs = paths.map((path, idx) => {
    const label = path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
    const isLast = idx === paths.length - 1;
    return (
      <div key={path} className="flex items-center text-xs font-semibold tracking-wide">
        <span className={isLast ? "text-zinc-900 dark:text-white" : "text-zinc-400"}>
          {label}
        </span>
        {!isLast && <span className="mx-2 text-zinc-300 dark:text-zinc-700">/</span>}
      </div>
    );
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition lg:hidden"
        >
          <HiOutlineSquares2X2 className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center">
          {breadcrumbs}
        </div>
      </div>

      {/* Right: Search, Actions, Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Global Search */}
        <div className="hidden md:flex items-center relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-64 pl-9 pr-4 py-2 bg-zinc-100 dark:bg-[#161616] border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-full text-xs font-semibold outline-none transition-all focus:w-72"
          />
          <div className="absolute right-2 px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-400">
            ⌘K
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 border-r border-zinc-200 dark:border-zinc-800 pr-4 sm:pr-6">
          <button onClick={toggleTheme} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
          </button>
          
          <button className="relative p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <HiOutlineBellAlert className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Profile & Date */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-zinc-900 dark:text-white">
              {adminUser?.displayName || adminUser?.email?.split("@")[0] || "Administrator"}
            </p>
            <p className="text-[10px] font-semibold text-zinc-500">{currentDate}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-black ring-2 ring-zinc-200 dark:ring-zinc-800">
            {(adminUser?.displayName || adminUser?.email || "A").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
