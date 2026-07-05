"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";
import { FaChevronUp } from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/authService";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const menus = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: HiOutlineHome,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: HiOutlineCube,
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: HiOutlineShoppingBag,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: HiOutlineUsers,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: HiOutlineCog6Tooth,
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login"); // 🔥 Always send to login after admin logout
    } catch (error) {
      console.error(error);
    }
  };

  // 🔥 Safety guard — should not render if not admin (layout handles redirect)
  if (!user || role !== "admin") return null;

  const userInitial =
    user?.displayName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "A";

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "Admin";
  };

  return (
    <aside className="w-[300px] min-h-screen bg-black text-white flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* 🔥 Logo - LARGER */}
      <div className="px-6 pt-8 pb-8">
        <h1 className="text-3xl font-black tracking-[0.15em] text-white leading-none">
          ENDER
        </h1>
        <p className="text-[11px] tracking-[0.4em] text-gray-500 font-medium leading-none mt-2">
          ADMIN PANEL
        </p>
      </div>

      {/* 🔥 Navigation - LARGER */}
      <div className="flex-1 px-4 py-4">
        <nav className="flex flex-col gap-2">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = pathname === menu.href || pathname.startsWith(menu.href + "/");

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`
                  relative flex items-center gap-4
                  px-5 py-4
                  rounded-xl
                  transition-all duration-200
                  text-base font-medium
                  ${active
                    ? "bg-zinc-800 text-white"
                    : "text-gray-400 hover:bg-zinc-900 hover:text-white"
                  }
                `}
              >
                {/* 🔥 Active Indicator - Left border */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
                
                <Icon className={`text-2xl ${active ? "text-white" : "text-gray-500"}`} />
                <span>{menu.title}</span>
                
                {/* 🔥 Active Badge - Right side */}
                {active && (
                  <span className="ml-auto text-[10px] font-medium text-white/50">
                    ●
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 🔥 User Section - LARGER */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="
            w-full
            flex
            items-center
            justify-between
            rounded-xl
            px-4
            py-3.5
            hover:bg-zinc-900
            transition-all
            duration-200
            group
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                w-11 h-11
                rounded-full
                bg-zinc-800
                text-white
                flex
                items-center
                justify-center
                font-bold
                text-base
                ring-1
                ring-white/10
                transition
                group-hover:bg-zinc-700
              "
            >
              {userInitial}
            </div>
            <div className="text-left">
              <p className="text-base font-semibold text-white truncate max-w-[130px]">
                {getUserName()}
              </p>
              <p className="text-[11px] text-gray-500">Administrator</p>
            </div>
          </div>
          <FaChevronUp
            className={`text-sm text-gray-500 transition-transform duration-200 ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {profileOpen && (
          <div className="mt-3 flex flex-col gap-1 bg-zinc-900 rounded-xl p-1.5">
            <Link
              href="/profile"
              className="
                flex items-center gap-3
                px-4 py-3
                rounded-lg
                text-sm
                text-gray-300
                hover:bg-zinc-800
                hover:text-white
                transition
              "
            >
              <HiOutlineUser className="text-lg text-gray-500" />
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="
                flex items-center gap-3
                text-left
                px-4
                py-3
                rounded-lg
                text-sm
                text-red-400
                hover:bg-zinc-800
                hover:text-red-300
                transition
              "
            >
              <HiOutlineLogout className="text-lg" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}