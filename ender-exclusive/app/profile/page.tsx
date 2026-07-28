"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  RotateCcw,
  LogOut,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit3,
  Save,
  Lock,
  Heart,
  Trash2,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, record, loading } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<"details" | "address" | "wishlist" | "security">("details");

  // Editable form fields
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cartSuccessMsg, setCartSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      const recordName = record?.firstName ? `${record.firstName || ""} ${record.lastName || ""}`.trim() : "";
      setDisplayName(user.displayName || recordName || user.email?.split("@")[0] || "");

      // Load detailed profile from firestore if available
      const loadProfile = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.phone) setPhone(data.phone);
            if (data.address) setAddress(data.address);
            if (data.city) setCity(data.city);
            if (data.postalCode) setPostalCode(data.postalCode);
          }
        } catch (e) {
          console.error("Error fetching extra profile details:", e);
        }
      };
      loadProfile();
    }
  }, [user, record]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          displayName,
          phone,
          address,
          city,
          postalCode,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Could not update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = (item: any) => {
    if (!user) return;
    const finalPrice = item.isOnSale && item.salePrice ? item.salePrice : item.price;

    addItem({
      userId: user.uid,
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: finalPrice,
      color: "Standard",
      size: "M",
      quantity: 1,
      stock: 50,
      deliveryCharge: 350,
    });

    setCartSuccessMsg(`Added ${item.name} to cart!`);
    setTimeout(() => setCartSuccessMsg(""), 3500);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070707] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Loading Account Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center px-4 py-24">
        <div className="text-center space-y-6 max-w-md bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-xl">
          <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 w-fit mx-auto">
            <UserIcon className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight">Not Logged In</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Please sign in to access your Ender Exclusive customer dashboard, order history, and saved address.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-amber-300 transition shadow-xl hover:scale-105"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Member initials badge
  const userInitials = (displayName || user.email || "E")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300 pb-32">

      {/* ===== 1. HERO PROFILE BANNER ===== */}
      <section className="relative bg-[#070707] text-white py-16 sm:py-24 border-b border-zinc-800/80 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">

          {/* User Identity Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-black text-3xl sm:text-4xl flex items-center justify-center shadow-2xl border-4 border-black/30">
              {userInitials}
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ENDER EXCLUSIVE ACCOUNT</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white">
                {displayName || "Valued Customer"}
              </h1>
              <p className="text-sm font-medium text-zinc-400 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="/orders"
              className="px-6 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2.5 transition shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>My Orders</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-6 py-3.5 rounded-2xl bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-2.5 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </section>

      {/* ===== 2. BREADCRUMB BAR ===== */}
      <div className="bg-zinc-50 dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800 py-3.5">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-bold">My Account Profile</span>
          </div>
        </div>
      </div>

      {/* ===== 3. DASHBOARD MAIN CONTAINER ===== */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="space-y-6 lg:col-span-1">
            <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-2">
              <button
                onClick={() => setActiveTab("details")}
                className={`w-full p-4 rounded-2xl font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === "details"
                    ? "bg-amber-400 text-black shadow-lg"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Personal Details</span>
              </button>

              <button
                onClick={() => setActiveTab("address")}
                className={`w-full p-4 rounded-2xl font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === "address"
                    ? "bg-amber-400 text-black shadow-lg"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Shipping Address</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full p-4 rounded-2xl font-semibold text-xs uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === "security"
                    ? "bg-amber-400 text-black shadow-lg"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
              >
                <Lock className="w-4 h-4" />
                <span>Account Security</span>
              </button>
            </div>

            {/* Quick Links Card */}
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500">Quick Shortcuts</h3>
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:border-amber-400 transition"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    Track Purchases
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/return-and-exchange-policy-ender-wear"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:border-amber-400 transition"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-500" />
                    Return Policy
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* RIGHT CONTENT PANEL */}
          <div className="lg:col-span-3 space-y-8">

            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Account profile details saved successfully!</span>
              </motion.div>
            )}

            {cartSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{cartSuccessMsg}</span>
              </motion.div>
            )}

            {/* ===== TAB 1: PERSONAL DETAILS ===== */}
            {activeTab === "details" && (
              <div className="p-8 sm:p-10 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                      PROFILE INFO
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Personal Details</h2>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-2xl bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-300 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Full Name / Username
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-sm font-semibold focus:outline-none focus:border-amber-400 disabled:opacity-70"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Email Address (Account ID)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email || ""}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-sm font-semibold focus:outline-none opacity-60 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Phone Number (For Delivery Confirmation)
                      </label>
                      <input
                        type="tel"
                        disabled={!isEditing}
                        placeholder="+94 77 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-sm font-semibold focus:outline-none focus:border-amber-400 disabled:opacity-70"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-4 rounded-2xl bg-amber-400 text-black font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-amber-300 transition shadow-lg cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* ===== TAB 2: SHIPPING ADDRESS ===== */}
            {activeTab === "address" && (
              <div className="p-8 sm:p-10 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                      SHIPPING INFORMATION
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Saved Delivery Address</h2>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-2xl bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-amber-300 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Address</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                        Street Address / Apartment
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        placeholder="No. 45, Galle Road"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-sm font-bold focus:outline-none focus:border-amber-400 disabled:opacity-70"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                          City / District
                        </label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          placeholder="Colombo / Dehiwala"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full p-4 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-sm font-bold focus:outline-none focus:border-amber-400 disabled:opacity-70"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          placeholder="10350"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full p-4 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-sm font-bold focus:outline-none focus:border-amber-400 disabled:opacity-70"
                        />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">Islandwide Dispatch Guarantee</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Your saved shipping address is automatically pre-filled during checkout for fast 1-2 day Sri Lanka courier dispatch.
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-4 rounded-2xl bg-amber-400 text-black font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-amber-300 transition shadow-lg cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? "Saving..." : "Save Address"}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
            {/* ===== TAB 4: ACCOUNT SECURITY ===== */}
            {activeTab === "security" && (
              <div className="p-8 sm:p-10 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-8">
                <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                    PROTECTION & AUTHENTICATION
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Account Security</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider">Account Termination</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        Sign out safely from your current browser session.
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-3 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-wider hover:bg-red-500 transition shadow-md cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </main>
  );
}
