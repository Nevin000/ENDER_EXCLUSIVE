"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { loginUser, signInWithGoogle } from "@/services/authService";
import { getUserData } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 If already logged in, redirect to appropriate page
  // This prevents logged-in users from seeing the login page
  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, role, authLoading, router]);

  const handleLogin = async () => {
    try {
      setError("");

      if (!email || !password) {
        setError("Please fill all fields");
        return;
      }

      setLoading(true);

      const loggedInUser = await loginUser(email, password);
      const userData = await getUserData(loggedInUser.uid);

      // 🔥 Role-based redirect
      if (userData?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      const msg = error.message || "";
      // 🔥 Friendlier Firebase error messages
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        setError("Invalid email or password. Please try again.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const googleUser = await signInWithGoogle();
      const userData = await getUserData(googleUser.uid);

      // 🔥 Role-aware redirect for Google sign-in
      if (userData?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("popup-closed-by-user") || msg.includes("cancelled-popup-request")) {
        setError(""); // User cancelled — not an error
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  // Show spinner while checking existing session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already logged in — will redirect via useEffect
  if (user && role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10"
      >
        <div className="text-center mb-10">
          <p className="uppercase tracking-[0.4em] text-gray-500 text-sm">
            Ender Exclusive
          </p>
          <h1 className="text-4xl font-bold mt-4">Welcome Back</h1>
          <p className="text-gray-500 mt-3">Sign in to your account</p>
        </div>

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="current-password"
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="relative my-6">
            <div className="border-t" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-sm text-gray-500">
              OR
            </span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-gray-300 py-4 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 pt-2">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-black font-medium hover:underline">
              Register
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
