"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-24">
        <div className="text-center text-lg text-gray-700">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-24 gap-4">
        <p className="text-xl font-semibold text-gray-900">
          Please sign in to view your dashboard.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-black px-6 py-3 text-white transition hover:bg-gray-900"
        >
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-gray-50 p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-3 text-gray-600">
          Your account activity and analytics will appear here soon.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">0</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Wish List</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">0</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Last Login</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
