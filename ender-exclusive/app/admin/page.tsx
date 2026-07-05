"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineTrendingUp,
} from "react-icons/hi";

export default function AdminPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (role && role !== "admin") {
        router.replace("/");
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== "admin") {
    return null; // Layout handles the spinner/redirect
  }

  const cards = [
    {
      title: "Products",
      description: "Manage your product catalog",
      href: "/admin/products",
      icon: HiOutlineCube,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Orders",
      description: "View and manage customer orders",
      href: "/admin/orders",
      icon: HiOutlineShoppingBag,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Users",
      description: "Manage registered users",
      href: "/admin/users",
      icon: HiOutlineUsers,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">
          Welcome back, {user.displayName || user.email?.split("@")[0]}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={card.href}
                className="block bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
              >
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon className="text-2xl" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{card.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
