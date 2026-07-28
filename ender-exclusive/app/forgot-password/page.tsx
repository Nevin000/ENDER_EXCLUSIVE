"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
} from "lucide-react";

import { resetPassword } from "@/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      const msg: string = err?.message || "";
      if (
        msg.includes("user-not-found") ||
        msg.includes("auth/user-not-found") ||
        msg.includes("INVALID_EMAIL") ||
        msg.includes("auth/invalid-email")
      ) {
        setError("No account found with this email address.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError(msg || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleReset();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0A0A0A] text-zinc-900 dark:text-white flex items-center justify-center">
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white dark:bg-[#111111] rounded-3xl border border-zinc-200/90 dark:border-[#2A2A2A] shadow-2xl overflow-hidden grid lg:grid-cols-12 min-h-[720px]"
        >
          {/* ===== LEFT SIDE BRAND IMAGE PANEL ===== */}
          <div className="lg:col-span-5 relative min-h-[400px] lg:min-h-full flex flex-col justify-between p-8 sm:p-12 text-white bg-black overflow-hidden group">

            {/* Full Background Image */}
            <Image
              src="/images/login_hero_bg.png"
              alt="Ender Exclusive Forgot Password"
              fill
              priority
              className="object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Overlay */}
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
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Account Recovery</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Forgot Your <br className="hidden sm:block" /> Password?
              </h2>

              <p className="text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                No worries — we&apos;ll send a secure reset link directly to your registered email address.
              </p>

              <div className="pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="block text-2xl font-black text-white">100%</span>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Secure</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-amber-400">Fast</span>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Delivery</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white">24/7</span>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Support</span>
                </div>
              </div>
            </div>

          </div>

          {/* ===== RIGHT SIDE FORM PANEL ===== */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#111111]">
            <div className="max-w-xl mx-auto w-full">

              {/* Back to Login */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition mb-8 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Link>

              <AnimatePresence mode="wait">

                {/* ── SUCCESS STATE ── */}
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="text-center space-y-6"
                  >
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-2">
                        Email Sent Successfully
                      </p>
                      <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                        Check Your Inbox
                      </h1>
                      <p className="text-zinc-500 dark:text-zinc-400 text-base font-semibold mt-3 leading-relaxed">
                        A password reset link has been sent to:
                      </p>
                      <p className="text-zinc-900 dark:text-white font-black text-lg mt-1 break-all">
                        {email}
                      </p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-left space-y-3">
                      <p className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Next Steps
                      </p>
                      {[
                        "Open the email from Ender Exclusive",
                        "Click the \u201cReset Password\u201d button in the email",
                        "Choose a new strong password",
                        "Sign in with your new password",
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-black flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{step}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">
                      Didn&apos;t receive the email?{" "}
                      <button
                        onClick={() => { setSent(false); setEmail(""); }}
                        className="text-zinc-900 dark:text-amber-400 font-black hover:underline"
                      >
                        Try again
                      </button>
                      {" "}or check your spam folder.
                    </p>

                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-3 w-full py-4 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black text-base rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl"
                    >
                      <span>Return to Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>

                ) : (

                  /* ── FORM STATE ── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div className="mb-8 sm:mb-10">
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 mb-2">
                        Password Recovery
                      </p>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                        Reset Password
                      </h1>
                      <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg font-semibold mt-2">
                        Enter your email and we&apos;ll send you a reset link
                      </p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-6">

                      {/* Email Field */}
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
                            autoFocus
                            className="w-full bg-zinc-100/80 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 font-bold text-base transition shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Error */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-start gap-2.5"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </motion.div>
                      )}

                      {/* Info note */}
                      <div className="flex items-start gap-2.5 px-4 py-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">
                          The reset link will be sent to your registered email address. It expires after <strong>1 hour</strong>.
                        </p>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black text-lg rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Sending Reset Link...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Reset Link</span>
                            <ArrowRight className="w-6 h-6" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-10 text-center border-t border-zinc-200 dark:border-zinc-800/80 pt-6 space-y-3">
                      <p className="text-zinc-600 dark:text-zinc-400 text-base font-semibold">
                        Remembered your password?{" "}
                        <Link href="/login" className="text-zinc-900 dark:text-amber-400 font-black hover:underline ml-1">
                          Sign In
                        </Link>
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400 text-base font-semibold">
                        New to Ender Exclusive?{" "}
                        <Link href="/register" className="text-zinc-900 dark:text-amber-400 font-black hover:underline ml-1">
                          Register Now
                        </Link>
                      </p>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
