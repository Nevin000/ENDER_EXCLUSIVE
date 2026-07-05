"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-24">
        <div className="text-center text-lg text-gray-700">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-24 gap-4">
        <p className="text-xl font-semibold text-gray-900">
          You are not logged in.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-black px-6 py-3 text-white transition hover:bg-gray-900"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-gray-50 p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">My Profile</h1>
        <p className="mt-3 text-gray-600">
          Welcome back! This is your profile overview.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Username</p>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {user.displayName ?? user.email?.split("@")[0] ?? "User"}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
