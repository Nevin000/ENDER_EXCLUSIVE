"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { FaChevronDown } from "react-icons/fa";
import {
  HiOutlineSearch,
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineLogout,
} from "react-icons/hi";
import { TbMenuDeep, TbX } from "react-icons/tb";

import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/authService";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { cartCount } = useCart();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenu(false);
  }, [pathname]);

  // Track scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const userInitial =
    user?.displayName?.charAt(0).toUpperCase() ??
    user?.email?.charAt(0).toUpperCase() ??
    "U";

  const userLabel = user?.email?.split("@")[0] ?? "User";

  const handleLogout = async () => {
    await logoutUser();
    setUserMenuOpen(false);
    setMobileMenu(false);
    router.push("/");
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100"
            : "bg-white border-b border-gray-100"
          }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div
            className={`flex items-center justify-between gap-4 transition-all duration-500 ${scrolled ? "h-16" : "h-20"
              }`}
          >
            {/* ===== LOGO - LARGER ===== */}
            <Link href="/" className="group shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white font-black text-lg">E</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-[0.2em] text-gray-900 leading-none">
                    ENDER
                  </h1>
                  <p className="text-[10px] tracking-[0.5em] text-gray-400 font-semibold leading-none mt-0.5">
                    EXCLUSIVE
                  </p>
                </div>
              </div>
            </Link>

            {/* ===== DESKTOP MENU - LARGER TEXT ===== */}
            <div className="hidden lg:flex items-center gap-8 xl:gap-12">
              {/* Home */}
              <Link
                href="/"
                className={`relative py-2 text-[17px] font-medium tracking-wide transition-colors duration-300 ${pathname === "/" ? "text-black" : "text-gray-600 hover:text-black"
                  }`}
              >
                Home
                {pathname === "/" && (
                  <span className="absolute -bottom-[2px] left-0 w-full h-[2.5px] bg-black rounded-full" />
                )}
              </Link>

              {/* Shop Dropdown */}
              <div className="relative group">
                <Link
                  href="/shop"
                  className={`flex items-center gap-1.5 py-2 text-[17px] font-medium tracking-wide transition-colors duration-300 ${isActive("/shop") ? "text-black" : "text-gray-600 hover:text-black"
                    }`}
                >
                  Shop
                  <FaChevronDown className="text-[11px] transition-transform duration-300 group-hover:rotate-180" />
                </Link>
                {isActive("/shop") && (
                  <span className="absolute -bottom-[2px] left-0 w-full h-[2.5px] bg-black rounded-full" />
                )}
                <div className="absolute top-full left-0 mt-6 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 overflow-hidden">
                  <div className="py-2 flex flex-col">
                    <Link
                      href="/shop/mens"
                      className="px-5 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                    >
                      Men's Wear
                    </Link>
                    <Link
                      href="/shop/fightwear"
                      className="px-5 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                    >
                      Fight Wear
                    </Link>
                    <Link
                      href="/shop/sportswear"
                      className="px-5 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                    >
                      Sports Wear
                    </Link>
                  </div>
                </div>
              </div>

              {/* On Sale */}
              <Link
                href="/on-sale"
                className={`relative py-2 text-[17px] font-medium tracking-wide transition-colors duration-300 ${isActive("/on-sale") ? "text-red-600" : "text-red-500 hover:text-red-600"
                  }`}
              >
                On Sale
                {isActive("/on-sale") && (
                  <span className="absolute -bottom-[2px] left-0 w-full h-[2.5px] bg-red-500 rounded-full" />
                )}
              </Link>

              {/* Featured Looks Dropdown */}
              <div className="relative group">
                <Link
                  href="/featured-looks"
                  className={`flex items-center gap-1.5 py-2 text-[17px] font-medium tracking-wide transition-colors duration-300 ${isActive("/featured-looks") ? "text-black" : "text-gray-600 hover:text-black"
                    }`}
                >
                  Featured Looks
                  <FaChevronDown className="text-[11px] transition-transform duration-300 group-hover:rotate-180" />
                </Link>
                {isActive("/featured-looks") && (
                  <span className="absolute -bottom-[2px] left-0 w-full h-[2.5px] bg-black rounded-full" />
                )}
                <div className="absolute top-full left-0 mt-6 w-52 bg-white border border-gray-100 shadow-xl rounded-2xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 overflow-hidden">
                  <div className="py-2 flex flex-col">
                    <Link
                      href="/featured-looks/fighters"
                      className="px-5 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                    >
                      Fighters
                    </Link>
                    <Link
                      href="/featured-looks/lookbook"
                      className="px-5 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                    >
                      Look Book
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/about"
                className={`relative py-2 text-[17px] font-medium tracking-wide transition-colors duration-300 ${isActive("/about") ? "text-black" : "text-gray-600 hover:text-black"
                  }`}
              >
                About
                {isActive("/about") && (
                  <span className="absolute -bottom-[2px] left-0 w-full h-[2.5px] bg-black rounded-full" />
                )}
              </Link>

              <Link
                href="/contact"
                className={`relative py-2 text-[17px] font-medium tracking-wide transition-colors duration-300 ${isActive("/contact") ? "text-black" : "text-gray-600 hover:text-black"
                  }`}
              >
                Contact
                {isActive("/contact") && (
                  <span className="absolute -bottom-[2px] left-0 w-full h-[2.5px] bg-black rounded-full" />
                )}
              </Link>
            </div>

            {/* ===== ICONS - LARGER ===== */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 🔥 Search - Modern */}
              <div ref={searchRef} className="relative">
                {searchOpen ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72 sm:w-80 animate-fadeIn">
                    <div className="relative">
                      <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/20 text-base shadow-lg"
                        autoFocus
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 group"
                  >
                    <HiOutlineSearch className="text-2xl text-gray-600 group-hover:text-black transition-colors" />
                  </button>
                )}
              </div>

              {/* Wishlist */}
              <button className="p-2.5 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 relative group">
                <HiOutlineHeart className="text-2xl text-gray-600 group-hover:text-black transition-colors" />
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  0
                </span>
              </button>

              {/* 🔥 Cart - Modern Badge */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 group"
              >
                <HiOutlineShoppingBag className="text-2xl text-gray-600 group-hover:text-black transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] bg-black text-white text-[11px] font-bold rounded-full px-1.5 flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <span className="hidden sm:block w-px h-7 bg-gray-200 mx-1" />

              {/* 🔥 User Profile - Modern */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  {user ? (
                    <span className="text-base font-bold uppercase text-black">
                      {userInitial}
                    </span>
                  ) : (
                    <HiOutlineUser className="text-2xl" />
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 min-w-[220px] bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 overflow-hidden animate-fadeIn">
                    <div className="p-4 border-b border-gray-100">
                      {user ? (
                        <>
                          <p className="text-base font-semibold text-gray-900">
                            {userLabel}
                          </p>
                          <p className="text-xs text-gray-400">Logged in</p>
                        </>
                      ) : (
                        <p className="text-base font-semibold text-gray-900">Welcome</p>
                      )}
                    </div>
                    <div className="flex flex-col p-1.5 gap-0.5">
                      {user ? (
                        <>
                          {/* 🔥 My Orders - Added */}
                          <Link
                            href="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                          >
                            My Orders
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                          >
                            My Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                          >
                            Dashboard
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl px-4 py-3 text-[15px] text-red-500 hover:text-red-600 hover:bg-red-50 transition text-left"
                          >
                            <div className="flex items-center gap-2">
                              <HiOutlineLogout className="text-xl" />
                              Logout
                            </div>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                          >
                            Login
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setUserMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-[15px] text-gray-600 hover:text-black hover:bg-gray-50 transition"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 transition-all duration-300"
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                {mobileMenu ? (
                  <TbX className="text-2xl text-gray-600" />
                ) : (
                  <TbMenuDeep className="text-2xl text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE MENU ===== */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[80px] bg-white/98 backdrop-blur-xl border-b border-gray-100 shadow-xl z-40 transition-all duration-300 ease-in-out ${mobileMenu
            ? "translate-y-0 opacity-100 visible"
            : "-translate-y-full opacity-0 invisible"
          }`}
      >
        <div className="p-6 flex flex-col gap-1.5 text-lg font-medium max-h-[calc(100vh-80px)] overflow-y-auto">
          {[
            { name: "Home", href: "/" },
            { name: "Shop", href: "/shop" },
            { name: "On Sale", href: "/on-sale" },
            { name: "Featured Looks", href: "/featured-looks" },
            { name: "About", href: "/about" },
            { name: "Contact", href: "/contact" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenu(false)}
              className={`px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive(item.href)
                  ? "bg-gray-100 text-black font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
            >
              {item.name}
            </Link>
          ))}

          <div className="border-t border-gray-100 my-2" />

          {user ? (
            <>
              {/* 🔥 My Orders - Added to mobile menu */}
              <Link
                href="/orders"
                onClick={() => setMobileMenu(false)}
                className="px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition"
              >
                My Orders
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenu(false)}
                className="px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition"
              >
                My Profile
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenu(false)}
                className="px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenu(false)}
                className="px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenu(false)}
                className="px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ===== ANIMATIONS ===== */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}