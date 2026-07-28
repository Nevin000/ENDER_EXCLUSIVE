"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { registerUser, logoutUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Flame,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, role } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setError("");

      if (user) {
        setError(
          `Another account (${user.email}) is currently signed in. Please log out before creating a new account.`
        );
        return;
      }

      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
        setError("Please fill in all required fields.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match. Please verify.");
        return;
      }

      setLoading(true);

      await registerUser(firstName.trim(), lastName.trim(), email.trim(), password);

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutActiveSession = async () => {
    await logoutUser();
    setError("");
  };

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
          {/* ===== LEFT SIDE BRAND IMAGE PANEL (WHITE/DARK DYNAMIC SHOWCASE) ===== */}
          <div className="lg:col-span-5 relative min-h-[400px] lg:min-h-full flex flex-col justify-between p-8 sm:p-12 text-white bg-black overflow-hidden group">
            {/* Background High-Res Image */}
            <Image
              src="/images/about/about_philosophy_fashion.png"
              alt="Ender Exclusive Lifestyle"
              fill
              priority
              className="object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 pointer-events-none" />

            {/* Content Layer */}
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

            {/* Bottom Highlights */}
            <div className="relative z-10 mt-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Join The Exclusive Community</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Crafted for Athletes & Champions
              </h2>

              <p className="text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                Create your official account to unlock early access to new drops, track orders in real-time, and manage your wishlist.
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

          {/* ===== RIGHT SIDE FORM PANEL (INCREASED FORM SIZE & MARGIN/PADDING) ===== */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#111111]">
            <div className="max-w-xl mx-auto w-full">
              {/* Header Title */}
              <div className="mb-8 sm:mb-10">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 mb-2">
                  Ender Exclusive Registration
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Create Your Account
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg font-semibold mt-2">
                  Fill in your details below to set up your profile
                </p>
              </div>

              {/* ACTIVE SESSION WARNING CARD */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 rounded-2xl space-y-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                        Active Session Detected
                      </p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium mt-0.5">
                        Currently signed in as <strong className="text-zinc-900 dark:text-white">{user.email}</strong> (
                        {role === "admin" ? "Admin" : "Customer"}).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => router.push(role === "admin" ? "/admin" : "/")}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow"
                    >
                      Go to Active Session <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleLogoutActiveSession}
                      className="py-3 px-4 bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={handleRegister} className="space-y-6">
                {/* First Name & Last Name Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-zinc-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading || !!user}
                        className="w-full bg-zinc-100/80 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 font-bold text-base transition shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-zinc-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading || !!user}
                        className="w-full bg-zinc-100/80 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 font-bold text-base transition shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-zinc-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || !!user}
                      className="w-full bg-zinc-100/80 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 font-bold text-base transition shadow-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-zinc-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || !!user}
                      className="w-full bg-zinc-100/80 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 font-bold text-base transition shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-zinc-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading || !!user}
                      className="w-full bg-zinc-100/80 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 font-bold text-base transition shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition p-1"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {password && confirmPassword && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-black">
                      {password === confirmPassword ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Passwords match perfectly
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Error Box */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading || !!user}
                  className="w-full py-4.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black text-lg rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>
              </form>

              {/* Login Redirection Link */}
              <div className="mt-10 text-center border-t border-zinc-200 dark:border-zinc-800/80 pt-6">
                <p className="text-zinc-600 dark:text-zinc-400 text-base font-semibold">
                  Already have an account?{" "}
                  <Link href="/login" className="text-zinc-900 dark:text-amber-400 font-black hover:underline ml-1">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
