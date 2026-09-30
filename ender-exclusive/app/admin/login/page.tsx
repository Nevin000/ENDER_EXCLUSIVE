"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  XCircle,
  Shield,
} from "lucide-react";

import { loginAdminUser, logoutAdminUser, resetPassword } from "@/services/authService";
import { validateUserAccess, getAdminLoginError } from "@/lib/authService";
import { useAdminAuth } from "@/context/AdminAuthContext";

// ─── Security Constants ──────────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;          // Lock after 5 failed attempts
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minute lockout
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;   // Reset counter after 10 minutes of no attempts
const STORAGE_KEY = "ender_admin_lockout";

// ─── Types ───────────────────────────────────────────────────────────────────
interface LockoutData {
  attempts: number;
  lastAttemptAt: number;
  lockedUntil: number | null;
}

function getLockoutData(): LockoutData {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { attempts: 0, lastAttemptAt: 0, lockedUntil: null };
    return JSON.parse(raw) as LockoutData;
  } catch {
    return { attempts: 0, lastAttemptAt: 0, lockedUntil: null };
  }
}

function saveLockoutData(data: LockoutData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { }
}

function clearLockoutData() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch { }
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const router = useRouter();
  const { adminUser, adminRole, adminLoading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Rate Limiting State ──────────────────────────────────────────────────
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);

  // ── Initialize from sessionStorage ──────────────────────────────────────
  useEffect(() => {
    const data = getLockoutData();
    const now = Date.now();

    // Clear stale attempts if last attempt was too long ago
    if (data.lastAttemptAt && now - data.lastAttemptAt > ATTEMPT_WINDOW_MS && !data.lockedUntil) {
      clearLockoutData();
      setAttemptsLeft(MAX_ATTEMPTS);
      return;
    }

    // Check if still locked
    if (data.lockedUntil && data.lockedUntil > now) {
      setIsLocked(true);
      setLockCountdown(data.lockedUntil - now);
      setAttemptsLeft(0);
    } else if (data.lockedUntil && data.lockedUntil <= now) {
      // Lockout expired — clear it
      clearLockoutData();
      setAttemptsLeft(MAX_ATTEMPTS);
    } else {
      setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - data.attempts));
    }
  }, []);

  // ── Countdown Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLocked || lockCountdown <= 0) return;

    const interval = setInterval(() => {
      setLockCountdown((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(interval);
          setIsLocked(false);
          setAttemptsLeft(MAX_ATTEMPTS);
          clearLockoutData();
          setError("");
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockCountdown]);

  // ── Auth redirect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!adminLoading && adminUser && adminRole === "admin") {
      router.replace("/admin");
    }
  }, [adminUser, adminRole, adminLoading, router]);

  // ── Record failed attempt ────────────────────────────────────────────────
  const recordFailedAttempt = useCallback(() => {
    const data = getLockoutData();
    const now = Date.now();
    const newAttempts = data.attempts + 1;

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_DURATION_MS;
      saveLockoutData({ attempts: newAttempts, lastAttemptAt: now, lockedUntil });
      setIsLocked(true);
      setLockCountdown(LOCKOUT_DURATION_MS);
      setAttemptsLeft(0);
    } else {
      saveLockoutData({ attempts: newAttempts, lastAttemptAt: now, lockedUntil: null });
      setAttemptsLeft(MAX_ATTEMPTS - newAttempts);
    }
  }, []);

  // ── 2FA & Password Reset State ───────────────────────────────────────────
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState("");

  // ── Handle Admin Password Reset ──────────────────────────────────────────
  const handleAdminResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError("Please enter your admin email address.");
      return;
    }
    try {
      setResetLoading(true);
      setResetError("");
      await resetPassword(resetEmail.trim());
      setResetSent(true);
    } catch (err: any) {
      setResetError("Failed to send reset email. Ensure the email is correct.");
    } finally {
      setResetLoading(false);
    }
  };

  // ── Handle Login ─────────────────────────────────────────────────────────
  const handleAdminLogin = async () => {
    if (isLocked) return;

    try {
      setError("");

      if (!email.trim() || !password) {
        setError("Please enter both email and password.");
        return;
      }

      setLoading(true);

      // Step 1: Authenticate via isolated adminAuth Firebase instance
      const loggedInAdmin = await loginAdminUser(email.trim(), password);

      // Step 2: Validate role === "admin" AND status === "active"
      const result = await validateUserAccess(loggedInAdmin.uid, "admin");

      if (!result.valid) {
        await logoutAdminUser();
        recordFailedAttempt();
        // ⚠️ Security: generic message — don't reveal role mismatch details
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Step 3: Success — clear lockout, redirect
      clearLockoutData();
      router.replace("/admin");
    } catch (err: any) {
      const msg: string = err?.message || "";
      recordFailedAttempt();

      if (err.code === "auth/multi-factor-auth-required") {
        setMfaResolver(err);
        setError("");
        setLoading(false);
        return;
      }

      if (
        msg.includes("invalid-credential") ||
        msg.includes("INVALID_LOGIN_CREDENTIALS") ||
        msg.includes("wrong-password") ||
        msg.includes("user-not-found") ||
        msg.includes("auth/invalid-email")
      ) {
        setError("Invalid credentials. Please try again.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many failed attempts. Your account has been temporarily locked by Firebase.");
      } else if (msg.includes("network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Authentication failed. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLocked) handleAdminLogin();
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const attemptBarWidth = `${(attemptsLeft / MAX_ATTEMPTS) * 100}%`;
  const attemptBarColor =
    attemptsLeft >= 3 ? "bg-amber-400" : attemptsLeft >= 1 ? "bg-orange-500" : "bg-red-600";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-black text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-zinc-950 rounded-3xl p-8 sm:p-10 border border-zinc-800 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-amber-400">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase text-white">
            ENDER ADMIN
          </h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
            Administrator Portal Sign In
          </p>
        </div>

        {/* ── LOCKED STATE ── */}
        <AnimatePresence mode="wait">
          {isLocked ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5"
            >
              {/* Lock Icon */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                  <XCircle className="w-9 h-9 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-red-400 font-black text-sm uppercase tracking-wider">
                    Access Temporarily Locked
                  </p>
                  <p className="text-zinc-400 text-xs font-medium mt-1">
                    Too many failed attempts detected
                  </p>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Try Again In</span>
                </div>
                <p className="text-4xl font-black text-white tabular-nums">
                  {formatCountdown(lockCountdown)}
                </p>
                <p className="text-xs text-zinc-500 font-medium">minutes : seconds</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Security Notice
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  This portal is protected against brute-force attacks. Repeated failures will extend the lockout period. If this wasn&apos;t you, contact your system administrator.
                </p>
              </div>
            </motion.div>

          ) : (

            /* ── FORM STATE ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key={error}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-950/80 border border-red-800/80 text-red-300 rounded-2xl text-xs font-semibold flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attempts remaining warning */}
              {attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-400 uppercase tracking-wider">Login Attempts</span>
                    <span className={attemptsLeft <= 1 ? "text-red-400" : "text-orange-400"}>
                      {attemptsLeft} remaining
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${attemptBarColor} transition-all duration-500`}
                      style={{ width: attemptBarWidth }}
                    />
                  </div>
                  {attemptsLeft === 1 && (
                    <p className="text-red-400 text-xs font-bold text-center animate-pulse">
                      ⚠ One more failure will lock this portal for 15 minutes
                    </p>
                  )}
                </motion.div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Admin Email Address"
                  disabled={loading || isLocked}
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Admin Password"
                  disabled={loading || isLocked}
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetModal(true);
                    setResetSent(false);
                    setResetError("");
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
                >
                  Forgot Admin Password?
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleAdminLogin}
                disabled={loading || isLocked}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Sign In to Admin Portal"
                )}
              </button>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Shield className="w-3.5 h-3.5 text-zinc-600" />
                <p className="text-[11px] text-zinc-600 font-semibold">
                  Protected · {MAX_ATTEMPTS} attempt limit · 15 min lockout · 2FA Support
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESET PASSWORD MODAL ── */}
        <AnimatePresence>
          {showResetModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">
                    Reset Admin Password
                  </h3>
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="text-zinc-500 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                {resetSent ? (
                  <div className="space-y-4 text-center py-4">
                    <p className="text-sm text-emerald-400 font-semibold">
                      A password reset link has been sent to <strong>{resetEmail}</strong> via Firebase Auth.
                    </p>
                    <button
                      onClick={() => setShowResetModal(false)}
                      className="w-full py-3 bg-zinc-900 border border-zinc-800 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition uppercase tracking-wider"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      Enter your administrative email address to receive a secure password reset link.
                    </p>

                    {resetError && (
                      <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs font-semibold">
                        {resetError}
                      </div>
                    )}

                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Admin Email Address"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setShowResetModal(false)}
                        className="w-1/2 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAdminResetPassword}
                        disabled={resetLoading}
                        className="w-1/2 py-3 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black rounded-xl transition uppercase tracking-wider disabled:opacity-50"
                      >
                        {resetLoading ? "Sending..." : "Send Reset Email"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center pt-6 mt-4 border-t border-zinc-900">
          <a
            href="/"
            className="text-xs font-semibold text-zinc-500 hover:text-white transition"
          >
            ← Return to Ender Exclusive Store
          </a>
        </div>
      </motion.div>
    </div>
  );
}
