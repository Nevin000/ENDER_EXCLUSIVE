"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Flame,
  Shirt,
  Dumbbell,
  Tag,
  Package,
  Layers,
  ShieldCheck,
  Zap,
  Heart,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/authService";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { FaWhatsapp } from "react-icons/fa";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenu(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Track scroll position for glassmorphism border accent
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  const userInitial =
    user?.displayName?.charAt(0).toUpperCase() ??
    user?.email?.charAt(0).toUpperCase() ??
    "U";

  const userLabel =
    user?.displayName || user?.email?.split("@")[0] || "Account";

  const handleLogout = async () => {
    await logoutUser();
    setUserMenuOpen(false);
    setMobileMenu(false);
    router.push("/");
  };

  return (
    <>
      {/* ===== PREMIUM LIGHT COLOR NAVBAR HEADER ===== */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${scrolled
          ? "bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl shadow-md border-b border-zinc-200/80 dark:border-[#2A2A2A]"
          : "bg-white dark:bg-[#0A0A0A] border-b border-zinc-200/80 dark:border-[#1F1F1F]"
          }`}
      >
        <div className="w-full max-w-[1850px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8 h-20 sm:h-24 lg:h-28">
            {/* 1. BRAND LOGO (RESPONSIVE SCALING) */}
            <Link href="/" className="group flex items-center shrink-0">
              <Image
                src="/images/Ender_black_logo.png"
                alt="Ender Exclusive"
                width={480}
                height={160}
                priority
                className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* 2. CENTER NAVIGATION LINKS (DESKTOP & LARGE TABLET) */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-10 text-lg xl:text-2xl font-extrabold tracking-wide">
              {/* Home */}
              <Link
                href="/"
                className={`relative py-1 transition-colors duration-200 ${pathname === "/"
                  ? "text-black dark:text-white font-black"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                  }`}
              >
                Home
                {pathname === "/" && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute -bottom-[2px] left-0 w-full h-[3.5px] bg-black dark:bg-white rounded-full"
                  />
                )}
              </Link>

              {/* Shop Mega Dropdown */}
              <div className="relative group">
                <Link
                  href="/shop"
                  className={`flex items-center gap-1.5 py-1 transition-colors duration-200 ${isActive("/shop")
                    ? "text-black dark:text-white font-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                    }`}
                >
                  <span>Shop</span>
                  <ChevronDown className="w-5.5 h-5.5 transition-transform duration-300 group-hover:rotate-180 text-zinc-500" />
                </Link>

                {isActive("/shop") && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute -bottom-[2px] left-0 w-full h-[3.5px] bg-black dark:bg-white rounded-full"
                  />
                )}

                {/* Shop Mega Menu Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-[520px] bg-white dark:bg-[#111111] border border-zinc-200 dark:border-[#2A2A2A] shadow-2xl rounded-2xl opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 overflow-hidden p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/shop/mens"
                      className="group/item flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1A1A1A] transition"
                    >
                      <div className="p-3 bg-zinc-100 dark:bg-[#2A2A2A] rounded-xl text-zinc-800 dark:text-zinc-200">
                        <Shirt className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-zinc-900 dark:text-white block">
                          Men's Wear
                        </span>
                        <span className="text-xs text-zinc-500">Hoodies, jackets & apparel</span>
                      </div>
                    </Link>

                    <Link
                      href="/shop/fightwear"
                      className="group/item flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1A1A1A] transition"
                    >
                      <div className="p-3 bg-amber-100 dark:bg-amber-950/40 rounded-xl text-amber-600">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-zinc-900 dark:text-white block">
                          Fight Wear
                        </span>
                        <span className="text-xs text-zinc-500">Gloves, rashguards & gear</span>
                      </div>
                    </Link>

                    <Link
                      href="/shop/sportswear"
                      className="group/item flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1A1A1A] transition"
                    >
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
                        <Dumbbell className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-zinc-900 dark:text-white block">
                          Sports Wear
                        </span>
                        <span className="text-xs text-zinc-500">Athletic & workout clothing</span>
                      </div>
                    </Link>

                    <Link
                      href="/shop"
                      className="group/item flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1A1A1A] transition"
                    >
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
                        <Tag className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-zinc-900 dark:text-white block">
                          All Collections
                        </span>
                        <span className="text-xs text-zinc-500">Browse entire product line</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* On Sale */}
              <Link
                href="/on-sale"
                className={`relative py-1 flex items-center gap-1.5 transition-colors duration-200 ${isActive("/on-sale")
                  ? "text-red-600 font-black"
                  : "text-red-600 hover:text-red-700"
                  }`}
              >
                <Zap className="w-6.5 h-6.5 fill-red-600 animate-pulse" />
                <span className="font-black">On Sale</span>
                <span className="px-2.5 py-0.5 text-xs font-black uppercase bg-red-600 text-white rounded-full ml-1">
                  SALE
                </span>
                {isActive("/on-sale") && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute -bottom-[2px] left-0 w-full h-[3.5px] bg-red-600 rounded-full"
                  />
                )}
              </Link>

              {/* Featured Looks Dropdown */}
              <div className="relative group">
                <Link
                  href="/featured-looks"
                  className={`flex items-center gap-1.5 py-1 transition-colors duration-200 ${isActive("/featured-looks")
                    ? "text-black dark:text-white font-black"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                    }`}
                >
                  <span>Featured Looks</span>
                  <ChevronDown className="w-5.5 h-5.5 transition-transform duration-300 group-hover:rotate-180 text-zinc-500" />
                </Link>

                {isActive("/featured-looks") && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute -bottom-[2px] left-0 w-full h-[3.5px] bg-black dark:bg-white rounded-full"
                  />
                )}

                <div className="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-[#111111] border border-zinc-200 dark:border-[#2A2A2A] shadow-2xl rounded-2xl opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 overflow-hidden p-2.5">
                  <Link
                    href="/featured-looks/fighters"
                    className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1A1A1A] transition text-zinc-800 dark:text-zinc-200 text-base font-bold"
                  >
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Fighters</span>
                  </Link>

                  <Link
                    href="/featured-looks/lookbook"
                    className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1A1A1A] transition text-zinc-800 dark:text-zinc-200 text-base font-bold"
                  >
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <span>Look Book</span>
                  </Link>
                </div>
              </div>

              {/* About */}
              <Link
                href="/about"
                className={`relative py-1 transition-colors duration-200 ${isActive("/about")
                  ? "text-black dark:text-white font-black"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                  }`}
              >
                About
                {isActive("/about") && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute -bottom-[2px] left-0 w-full h-[3.5px] bg-black dark:bg-white rounded-full"
                  />
                )}
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className={`relative py-1 transition-colors duration-200 ${isActive("/contact")
                  ? "text-black dark:text-white font-black"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                  }`}
              >
                Contact
                {isActive("/contact") && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute -bottom-[2px] left-0 w-full h-[3.5px] bg-black dark:bg-white rounded-full"
                  />
                )}
              </Link>
            </nav>

            {/* 3. RIGHT HEADER TOOLS (RESPONSIVE FOR ALL DEVICES) */}
            <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6 shrink-0">

              {/* Account Dropdown (INCREASED PROFILE AVATAR SIZE) */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 cursor-pointer group focus:outline-none"
                  aria-label="User Account"
                >
                  {user ? (
                    <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-500 text-black font-black text-lg flex items-center justify-center shadow border-2 border-amber-300 transition-transform group-hover:scale-105">
                      {userInitial}
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-zinc-100 dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 flex items-center justify-center group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 transition border border-zinc-200 dark:border-[#2A2A2A]">
                      <User className="w-7.5 h-7.5" />
                    </div>
                  )}

                  <div className="hidden xl:block text-left leading-tight">
                    <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Welcome</span>
                    <span className="block text-base font-black text-zinc-900 dark:text-white truncate max-w-[130px]">
                      {user ? userLabel : "Sign in / Register"}
                    </span>
                  </div>
                </button>

                {/* USER DROPDOWN POPUP */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-3 w-76 bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] shadow-2xl rounded-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white relative overflow-hidden">
                        {user ? (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-base flex items-center justify-center shrink-0">
                              {userInitial}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-base font-bold text-white truncate">{userLabel}</p>
                              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-base font-bold text-white">Welcome to Ender</p>
                            <p className="text-xs text-zinc-400">Sign in to manage orders & profile</p>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 space-y-1 bg-white dark:bg-[#111111]">
                        {user ? (
                          <>
                            <Link
                              href="/wishlist"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#1A1A1A]"
                            >
                              <div className="flex items-center gap-3">
                                <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
                                <span>My Wishlist</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-red-600/10 text-red-500 text-xs font-black">
                                {wishlist.length}
                              </span>
                            </Link>

                            <Link
                              href="/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#1A1A1A]"
                            >
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-amber-500" />
                                <span>My Orders</span>
                              </div>
                            </Link>

                            <Link
                              href="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#1A1A1A]"
                            >
                              <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-500" />
                                <span>My Profile</span>
                              </div>
                            </Link>

                            {role === "admin" && (
                              <Link
                                href="/dashboard"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                              >
                                <div className="flex items-center gap-3">
                                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                                  <span>Admin Dashboard</span>
                                </div>
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <div className="flex items-center gap-3">
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                              </div>
                            </button>
                          </>
                        ) : (
                          <div className="space-y-2 p-1">
                            <Link
                              href="/login"
                              onClick={() => setUserMenuOpen(false)}
                              className="block text-center py-3 px-4 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800"
                            >
                              Sign In
                            </Link>
                            <Link
                              href="/register"
                              onClick={() => setUserMenuOpen(false)}
                              className="block text-center py-3 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-sm font-bold hover:bg-zinc-200"
                            >
                              Register Account
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shopping Cart (INCREASED CART DESIGN SIZE ONLY) */}
              <Link
                href="/cart"
                className="flex items-center gap-2.5 cursor-pointer group"
                aria-label="Shopping Cart"
              >
                <div className="relative p-3.5 bg-zinc-100 dark:bg-[#18181B] rounded-full border border-zinc-200 dark:border-[#2A2A2A] text-zinc-800 dark:text-zinc-200 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 transition">
                  <ShoppingBag className="w-7.5 h-7.5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[24px] h-[24px] bg-black dark:bg-white text-white dark:text-black text-xs font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0A0A0A]">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Mobile Drawer Hamburger Trigger */}
              <button
                onClick={() => setMobileMenu((prev) => !prev)}
                className="lg:hidden p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#18181B] text-zinc-800 dark:text-zinc-200"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenu ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE DRAWER SIDEBAR ===== */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenu(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-[#0A0A0A] z-50 shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-[#1F1F1F]">
                <Image
                  src="/images/Ender_black_logo.png"
                  alt="Ender"
                  width={180}
                  height={60}
                  className="h-12 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileMenu(false)}
                  className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-[#1A1A1A] text-zinc-600 dark:text-zinc-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-1.5">
                <Link
                  href="/"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-2xl font-bold text-base text-zinc-800 dark:text-zinc-200"
                >
                  Home
                </Link>

                <Link
                  href="/shop/mens"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-2xl font-bold text-base text-zinc-800 dark:text-zinc-200"
                >
                  Men's Wear
                </Link>

                <Link
                  href="/shop/fightwear"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-2xl font-bold text-base text-zinc-800 dark:text-zinc-200"
                >
                  Fight Wear
                </Link>

                <Link
                  href="/on-sale"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-2xl font-bold text-base text-red-600 font-extrabold"
                >
                  On Sale
                </Link>

                <Link
                  href="/featured-looks"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-2xl font-bold text-base text-zinc-800 dark:text-zinc-200"
                >
                  Featured Looks
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-2xl font-bold text-base text-zinc-800 dark:text-zinc-200"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-2xl font-bold text-base text-zinc-800 dark:text-zinc-200"
                >
                  Contact
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== ULTRA-MODERN FLOATING BOTTOM-RIGHT WHATSAPP WIDGET ===== */}
      <a
        href="https://wa.me/94701813098"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] border border-emerald-400/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
        aria-label="WhatsApp Support"
      >
        <div className="relative flex items-center justify-center">
          <FaWhatsapp className="w-7 h-7 text-white transition-transform duration-300 group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200"></span>
          </span>
        </div>
        <div className="hidden sm:block text-left leading-tight pr-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
              Need Help?
            </span>
          </div>
          <span className="block text-sm font-extrabold text-white">
            Chat on WhatsApp
          </span>
        </div>
      </a>
    </>
  );
}