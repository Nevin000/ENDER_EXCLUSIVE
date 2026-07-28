"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCog6Tooth,
  HiOutlineSparkles,
  HiOutlineClipboardDocumentCheck,
  HiOutlineChartBar,
  HiOutlineChevronDown,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";
import { HiOutlineLogout } from "react-icons/hi";
import { FaChevronUp } from "react-icons/fa";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { logoutAdminUser } from "@/services/authService";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, adminRole } = useAdminAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [featuredLookOpen, setFeaturedLookOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-expand "Featured Look" dropdown if on lookbook or fighters route
  useEffect(() => {
    if (pathname.startsWith("/admin/lookbook") || pathname.startsWith("/admin/fighters")) {
      setFeaturedLookOpen(true);
    }
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutAdminUser();
      router.push("/admin/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (!adminUser || adminRole !== "admin") return null;

  const userInitial =
    adminUser?.displayName?.charAt(0).toUpperCase() ||
    adminUser?.email?.charAt(0).toUpperCase() ||
    "A";

  const getUserName = () => {
    if (adminUser?.displayName) return adminUser.displayName;
    if (adminUser?.email) return adminUser.email.split("@")[0];
    return "Admin";
  };

  const isFeaturedLookActive =
    pathname.startsWith("/admin/lookbook") || pathname.startsWith("/admin/fighters");

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className="px-8 pt-9 pb-8 border-b border-zinc-900 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-[0.18em] text-white leading-none">
            ENDER
          </h1>
          <p className="text-xs tracking-[0.4em] text-amber-400 font-black leading-none mt-2.5 uppercase">
            ADMIN PORTAL
          </p>
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-2.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 cursor-pointer"
        >
          <HiOutlineXMark className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-5 py-8 space-y-2.5 overflow-y-auto">
        <nav className="flex flex-col gap-2">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`
              relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-extrabold tracking-wide
              ${pathname === "/admin" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}
            `}
          >
            {pathname === "/admin" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-amber-400 rounded-r-full" />
            )}
            <HiOutlineHome className={`text-3xl ${pathname === "/admin" ? "text-amber-400" : "text-zinc-500"}`} />
            <span>Dashboard</span>
          </Link>

          {/* Products */}
          <Link
            href="/admin/products"
            className={`
              relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-extrabold tracking-wide
              ${pathname.startsWith("/admin/products") ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}
            `}
          >
            {pathname.startsWith("/admin/products") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-amber-400 rounded-r-full" />
            )}
            <HiOutlineCube className={`text-3xl ${pathname.startsWith("/admin/products") ? "text-amber-400" : "text-zinc-500"}`} />
            <span>Products</span>
          </Link>

          {/* Orders */}
          <Link
            href="/admin/orders"
            className={`
              relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-extrabold tracking-wide
              ${pathname.startsWith("/admin/orders") ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}
            `}
          >
            {pathname.startsWith("/admin/orders") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-amber-400 rounded-r-full" />
            )}
            <HiOutlineShoppingBag className={`text-3xl ${pathname.startsWith("/admin/orders") ? "text-amber-400" : "text-zinc-500"}`} />
            <span>Orders</span>
          </Link>

          {/* Customers */}
          <Link
            href="/admin/users"
            className={`
              relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-extrabold tracking-wide
              ${pathname.startsWith("/admin/users") ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}
            `}
          >
            {pathname.startsWith("/admin/users") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-amber-400 rounded-r-full" />
            )}
            <HiOutlineUsers className={`text-3xl ${pathname.startsWith("/admin/users") ? "text-amber-400" : "text-zinc-500"}`} />
            <span>Customers</span>
          </Link>

          {/* FEATURED LOOK COLLAPSIBLE DROPDOWN MENU */}
          <div className="space-y-1.5">
            <button
              onClick={() => setFeaturedLookOpen(!featuredLookOpen)}
              className={`
                w-full relative flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-extrabold tracking-wide cursor-pointer
                ${isFeaturedLookActive ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}
              `}
            >
              {isFeaturedLookActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-amber-400 rounded-r-full" />
              )}
              <div className="flex items-center gap-4">
                <HiOutlineSparkles className={`text-3xl ${isFeaturedLookActive ? "text-amber-400" : "text-zinc-500"}`} />
                <span>Featured Look</span>
              </div>
              <HiOutlineChevronDown className={`w-6 h-6 text-zinc-500 transition-transform duration-200 ${featuredLookOpen ? "rotate-180 text-amber-400" : ""}`} />
            </button>

            {/* Dropdown Sub-Items */}
            {featuredLookOpen && (
              <div className="pl-6 space-y-1.5 border-l-2 border-zinc-800 ml-7 my-2">
                <Link
                  href="/admin/lookbook"
                  className={`
                    flex items-center gap-3.5 px-5 py-3 rounded-xl text-base font-extrabold transition-all duration-200
                    ${pathname.startsWith("/admin/lookbook")
                      ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }
                  `}
                >
                  <HiOutlineSparkles className="w-5 h-5" />
                  <span>Look Book</span>
                </Link>

                <Link
                  href="/admin/fighters"
                  className={`
                    flex items-center gap-3.5 px-5 py-3 rounded-xl text-base font-extrabold transition-all duration-200
                    ${pathname.startsWith("/admin/fighters")
                      ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }
                  `}
                >
                  <HiOutlineUserGroup className="w-5 h-5" />
                  <span>Fighters Showcase</span>
                </Link>
              </div>
            )}
          </div>

          {/* Inventory */}
          <Link
            href="/admin/inventory"
            className={`
              relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-extrabold tracking-wide
              ${pathname.startsWith("/admin/inventory") ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}
            `}
          >
            {pathname.startsWith("/admin/inventory") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-amber-400 rounded-r-full" />
            )}
            <HiOutlineClipboardDocumentCheck className={`text-3xl ${pathname.startsWith("/admin/inventory") ? "text-amber-400" : "text-zinc-500"}`} />
            <span>Inventory</span>
          </Link>

          {/* Analytics */}
          <Link
            href="/admin/analytics"
            className={`
              relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-extrabold tracking-wide
              ${pathname.startsWith("/admin/analytics") ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}
            `}
          >
            {pathname.startsWith("/admin/analytics") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-amber-400 rounded-r-full" />
            )}
            <HiOutlineChartBar className={`text-3xl ${pathname.startsWith("/admin/analytics") ? "text-amber-400" : "text-zinc-500"}`} />
            <span>Analytics</span>
          </Link>

          {/* Settings */}
          <Link
            href="/admin/settings"
            className={`
              relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-extrabold tracking-wide
              ${pathname.startsWith("/admin/settings") ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}
            `}
          >
            {pathname.startsWith("/admin/settings") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-amber-400 rounded-r-full" />
            )}
            <HiOutlineCog6Tooth className={`text-3xl ${pathname.startsWith("/admin/settings") ? "text-amber-400" : "text-zinc-500"}`} />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* User Admin Profile Section */}
      <div className="p-5 border-t border-zinc-900">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full flex items-center justify-between rounded-2xl px-5 py-4 hover:bg-zinc-900 transition-all duration-200 group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center font-black text-lg ring-2 ring-amber-400/30 group-hover:bg-zinc-700 transition">
              {userInitial}
            </div>
            <div className="text-left">
              <p className="text-base font-extrabold text-white truncate max-w-[160px]">
                {getUserName()}
              </p>
              <p className="text-xs text-amber-400 font-black uppercase tracking-wider">
                Administrator
              </p>
            </div>
          </div>
          <FaChevronUp className={`text-sm text-zinc-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
        </button>

        {profileOpen && (
          <div className="mt-3 flex flex-col gap-1 bg-zinc-900 rounded-2xl p-2 border border-zinc-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left px-5 py-3.5 rounded-xl text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition font-extrabold cursor-pointer"
            >
              <HiOutlineLogout className="text-lg" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR (lg:hidden) */}
      <header className="lg:hidden sticky top-0 z-30 bg-black border-b border-zinc-800 px-6 py-4.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-3 rounded-2xl bg-zinc-900 text-white cursor-pointer hover:bg-zinc-800 transition"
            aria-label="Open Navigation Menu"
          >
            <HiOutlineBars3 className="w-7 h-7" />
          </button>
          <div>
            <span className="text-2xl font-black tracking-widest text-white">ENDER</span>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest ml-2">PORTAL</span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-full bg-zinc-800 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-400/30">
          {userInitial}
        </div>
      </header>

      {/* MOBILE OVERLAY DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-black text-white shadow-2xl border-r border-zinc-800 z-10"
            >
              <NavContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* DESKTOP STICKY SIDEBAR (lg:flex) */}
      <aside className="hidden lg:flex w-[340px] xl:w-[360px] min-h-screen bg-black text-white flex-col sticky top-0 h-screen overflow-y-auto z-40 border-r border-zinc-800 font-sans shrink-0">
        <NavContent />
      </aside>
    </>
  );
}