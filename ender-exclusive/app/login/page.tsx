"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { loginUser, signInWithGoogle, logoutUser } from "@/services/authService";
import { validateUserAccess, getCustomerLoginError } from "@/lib/authService";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in as a customer user, redirect to homepage
  useEffect(() => {
    if (!authLoading && user && role === "user") {
      router.replace("/");
    }
  }, [user, role, authLoading, router]);

  const handleLogin = async () => {
    try {
      setError("");

      if (!email.trim() || !password) {
        setError("Please enter your email and password.");
        return;
      }

      setLoading(true);

      const loggedInUser = await loginUser(email.trim(), password);
      const result = await validateUserAccess(loggedInUser.uid, "user");

      if (!result.valid) {
        await logoutUser();
        setError(getCustomerLoginError(result.error!, result.record?.role));
        setLoading(false);
        return;
      }

      router.replace("/");
    } catch (err: any) {
      const msg: string = err?.message || "";
      if (
        msg.includes("invalid-credential") ||
        msg.includes("INVALID_LOGIN_CREDENTIALS") ||
        msg.includes("wrong-password") ||
        msg.includes("user-not-found") ||
        msg.includes("auth/invalid-email")
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(msg || "Sign in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const googleUser = await signInWithGoogle();
      const result = await validateUserAccess(googleUser.uid, "user");

      if (!result.valid) {
        await logoutUser();
        setError(getCustomerLoginError(result.error!, result.record?.role));
        setLoading(false);
        return;
      }

      router.replace("/");
    } catch (err: any) {
      const msg: string = err?.message || "";
      if (
        msg.includes("popup-closed-by-user") ||
        msg.includes("cancelled-popup-request")
      ) {
        setError("");
      } else {
        setError(msg || "Google sign in failed.");
      }
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0A0A0A]">
        <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0A0A0A] text-zinc-900 dark:text-white flex items-center justify-center">
      {/* Website Standard Max Width Container */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white dark:bg-[#111111] rounded-3xl border border-zinc-200/90 dark:border-[#2A2A2A] shadow-2xl overflow-hidden grid lg:grid-cols-12 min-h-[720px]"
        >
          {/* ===== LEFT SIDE SINGLE IMAGE BRAND PANEL ===== */}
          <div className="lg:col-span-5 relative min-h-[400px] lg:min-h-full flex flex-col justify-between p-8 sm:p-12 text-white bg-black overflow-hidden group">

            {/* Single Full Background Image */}
            <Image
              src="/images/login_hero_bg.png"
              alt="Ender Exclusive Login"
              fill
              priority
              className="object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Overlay — top dark, mid clear, bottom dark */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/50 pointer-events-none" />

            {/* TOP — Logo */}
            <div className="relative z-10">
              <Link href="/" className="inline-block group/logo">
                <Image
                  src="/images/ender_white_footer_logo.png"
                  alt="Ender Exclusive"
                  width={340}
                  height={110}
                  className="h-16 sm:h-20 w-auto object-contain transition-transform group-hover/logo:scale-105"
                />
              </Link>
            </div>

            {/* BOTTOM — Tagline + Stats */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Welcome Back</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Your Exclusive <br className="hidden sm:block" /> Account Awaits
              </h2>

              <p className="text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                Sign in to unlock early access to new drops, track your orders in real-time, and manage your wishlist.
              </p>

              <div className="pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="block text-2xl font-black text-white">100%</span>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Authentic</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-amber-400">VIP</span>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Member Perks</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white">24/7</span>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Support</span>
                </div>
              </div>
            </div>

          </div>

          {/* ===== RIGHT SIDE LOGIN FORM PANEL ===== */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#111111]">
            <div className="max-w-xl mx-auto w-full">

              {/* Header Title */}
              <div className="mb-8 sm:mb-10">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 mb-2">
                  Ender Exclusive — Customer Portal
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg font-semibold mt-2">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">

                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      autoComplete="email"
                      className="w-full bg-zinc-100/80 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 font-bold text-base transition shadow-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-amber-400 transition"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      autoComplete="current-password"
                      className="w-full bg-zinc-100/80 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 font-bold text-base transition shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    key={error}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Sign In Button */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-4 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black text-lg rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="border-t border-zinc-200 dark:border-zinc-800" />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white dark:bg-[#111111] px-3 text-xs font-black text-zinc-400 uppercase tracking-widest">
                    OR
                  </span>
                </div>

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full border-2 border-zinc-200 dark:border-zinc-800 py-4 rounded-2xl font-black text-sm text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Footer Links */}
              <div className="mt-10 text-center border-t border-zinc-200 dark:border-zinc-800/80 pt-6 space-y-3">
                <p className="text-zinc-600 dark:text-zinc-400 text-base font-semibold">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-zinc-900 dark:text-amber-400 font-black hover:underline ml-1">
                    Register Now
                  </Link>
                </p>
                <div>
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
