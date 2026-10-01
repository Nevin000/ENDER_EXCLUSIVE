"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  HiOutlineBuildingStorefront,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineShare,
  HiOutlineMegaphone,
  HiOutlineCreditCard,
} from "react-icons/hi2";

import { FaSpinner, FaBuilding, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

export default function AdminSettingsPage() {
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"store" | "bank" | "delivery" | "social" | "profile">("store");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Store General Profile Settings
  const [storeName, setStoreName] = useState("Ender Exclusive");
  const [supportEmail, setSupportEmail] = useState("support@enderexclusive.com");
  const [supportPhone, setSupportPhone] = useState("+94 70 181 3098");
  const [currency, setCurrency] = useState("Rs.");
  const [storeAddress, setStoreAddress] = useState("Colombo, Sri Lanka");
  const [announcementText, setAnnouncementText] = useState(
    "Free Islandwide Shipping on Orders Over Rs. 10,000!"
  );

  // 2. Bank Account Transfer Details
  const [enableBankTransfer, setEnableBankTransfer] = useState(true);
  const [bankName, setBankName] = useState("Commercial Bank of Ceylon");
  const [accountTitle, setAccountTitle] = useState("ENDER EXCLUSIVE (PVT) LTD");
  const [accountNumber, setAccountNumber] = useState("8009123456");
  const [branchName, setBranchName] = useState("Colombo Main Branch");
  const [bankInstructions, setBankInstructions] = useState(
    "Please upload a clear picture or screenshot of your deposit receipt after completing the bank transfer."
  );

  // 3. Shipping & Delivery Fee Settings
  const [defaultDeliveryCharge, setDefaultDeliveryCharge] = useState("350");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("10000");

  // 4. Social Links & Email Notifications
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("enderexclusive@gmail.com");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/enderexclusive");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/enderexclusive");
  const [tiktokUrl, setTiktokUrl] = useState("https://tiktok.com/@enderexclusive");
  const [enableCod, setEnableCod] = useState(true);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch Store Config Settings from Firestore `settings/store_config`
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const docRef = doc(db, "settings", "store_config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.storeName) setStoreName(data.storeName);
          if (data.supportEmail) setSupportEmail(data.supportEmail);
          if (data.supportPhone) setSupportPhone(data.supportPhone);
          if (data.currency) setCurrency(data.currency);
          if (data.storeAddress) setStoreAddress(data.storeAddress);
          if (data.announcementText) setAnnouncementText(data.announcementText);

          if (data.enableBankTransfer !== undefined) setEnableBankTransfer(data.enableBankTransfer);
          if (data.bankName) setBankName(data.bankName);
          if (data.accountTitle) setAccountTitle(data.accountTitle);
          if (data.accountNumber) setAccountNumber(data.accountNumber);
          if (data.branchName) setBranchName(data.branchName);
          if (data.bankInstructions) setBankInstructions(data.bankInstructions);

          if (data.defaultDeliveryCharge !== undefined)
            setDefaultDeliveryCharge(data.defaultDeliveryCharge.toString());
          if (data.freeShippingThreshold !== undefined)
            setFreeShippingThreshold(data.freeShippingThreshold.toString());

          if (data.adminNotificationEmail) setAdminNotificationEmail(data.adminNotificationEmail);
          if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
          if (data.facebookUrl) setFacebookUrl(data.facebookUrl);
          if (data.tiktokUrl) setTiktokUrl(data.tiktokUrl);
          if (data.enableCod !== undefined) setEnableCod(data.enableCod);
        }
      } catch (err) {
        console.error("Failed to load settings from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // 2. Save Settings to Firestore
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        storeName,
        supportEmail,
        supportPhone,
        currency,
        storeAddress,
        announcementText,
        enableBankTransfer,
        bankName,
        accountTitle,
        accountNumber,
        branchName,
        bankInstructions,
        defaultDeliveryCharge: Number(defaultDeliveryCharge) || 0,
        freeShippingThreshold: Number(freeShippingThreshold) || 0,
        adminNotificationEmail,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        enableCod,
        updatedAt: Timestamp.now(),
        updatedBy: adminUser?.email || "Admin",
      };

      await setDoc(doc(db, "settings", "store_config"), payload, { merge: true });
      triggerToast("Store settings saved & synchronized successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save store settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans">
        <div className="relative bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl border border-white/20 dark:border-[#2A2A2A]/60 rounded-3xl p-16 text-center shadow-2xl shadow-black/5">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
            Loading Store Configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-zinc-950 dark:bg-white text-white dark:text-black px-6 py-4 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 font-semibold text-sm flex items-center gap-3"
          >
            <HiOutlineSparkles className="w-5 h-5 text-amber-400 dark:text-amber-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 1. HEADER SECTION ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black dark:from-[#111111] dark:via-[#18181B] dark:to-[#0D0D0D] text-white border border-zinc-800 dark:border-[#2A2A2A]/50 shadow-2xl p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-2">
              <span>Admin Portal</span>
              <HiOutlineChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-200">Settings</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
              Store <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-sm md:text-base font-medium text-zinc-400 mt-2.5 max-w-2xl leading-relaxed">
              Configure store identity, bank transfer details, islandwide shipping rates, notification email alerts, and social links.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs md:text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <FaSpinner className="w-4 h-4 animate-spin text-black" />
            ) : (
              <HiOutlineCheckCircle className="w-5 h-5 text-black" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Store Settings"}</span>
          </button>
        </div>
      </div>

      {/* ===== 2. TABBED NAVIGATION RIBBON ===== */}
      <div className="relative bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-3 shadow-sm flex flex-wrap items-center gap-2">
        {[
          { id: "store", label: "General Profile", icon: HiOutlineBuildingStorefront },
          { id: "bank", label: "Bank Transfer Details", icon: FaBuilding },
          { id: "delivery", label: "Shipping & Rates", icon: HiOutlineTruck },
          { id: "social", label: "Social & Alerts", icon: HiOutlineShare },
          { id: "profile", label: "Admin Profile", icon: HiOutlineShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs md:text-sm font-medium uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === tab.id
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===== 3. SETTINGS CONTENT CONTAINER ===== */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        <div className="relative bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl shadow-sm p-8 md:p-10">
          {/* TAB 1: GENERAL STORE PROFILE */}
          {activeTab === "store" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <HiOutlineBuildingStorefront className="w-6 h-6 text-amber-500" />
                Storefront Profile & Identity
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Official Store Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Currency Symbol / Code
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none cursor-pointer transition-all"
                  >
                    <option value="Rs.">Rs. (Rupees - LKR)</option>
                    <option value="USD">USD ($ - United States Dollar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Customer Support Email
                  </label>
                  <div className="relative">
                    <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Support Hotline / WhatsApp
                  </label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Top Announcement Bar Text
                </label>
                <div className="relative">
                  <HiOutlineMegaphone className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="e.g. Free Islandwide Shipping on Orders Over Rs. 10,000!"
                    className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Physical Headquarters / Address
                </label>
                <div className="relative">
                  <HiOutlineMapPin className="absolute left-4 top-4 text-zinc-400 w-5 h-5" />
                  <textarea
                    rows={3}
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-base font-medium text-zinc-900 dark:text-white outline-none resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: BANK TRANSFER DETAILS */}
          {activeTab === "bank" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <FaBuilding className="w-5 h-5 text-blue-500" />
                    Bank Deposit Account Details
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                    These account details are displayed to customers selecting Bank Transfer at checkout.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer bg-zinc-100 dark:bg-[#18181B] px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <input
                    type="checkbox"
                    checked={enableBankTransfer}
                    onChange={(e) => setEnableBankTransfer(e.target.checked)}
                    className="w-4 h-4 text-amber-500 focus:ring-amber-400 rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Enable Bank Transfer Option
                  </span>
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Commercial Bank of Ceylon"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Account Title / Beneficiary Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ENDER EXCLUSIVE (PVT) LTD"
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8009123456"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium font-mono text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Branch Name / IBAN
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo Main Branch"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Customer Deposit Receipt Instructions
                </label>
                <textarea
                  rows={3}
                  value={bankInstructions}
                  onChange={(e) => setBankInstructions(e.target.value)}
                  className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-base font-medium text-zinc-900 dark:text-white outline-none resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* TAB 3: SHIPPING & DELIVERY */}
          {activeTab === "delivery" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <HiOutlineTruck className="w-6 h-6 text-emerald-500" />
                Storefront Delivery & Shipping Rates
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Standard Islandwide Shipping Fee (Rs)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-amber-400 font-medium font-mono text-lg z-10 pointer-events-none">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={defaultDeliveryCharge}
                      onChange={(e) => setDefaultDeliveryCharge(e.target.value)}
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium font-mono text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 font-medium">Applied to orders unless specified per product</p>
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Free Shipping Order Threshold (Rs)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-amber-400 font-medium font-mono text-lg z-10 pointer-events-none">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium font-mono text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 font-medium">Orders exceeding this total qualify for free shipping</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SOCIAL LINKS & NOTIFICATIONS */}
          {activeTab === "social" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <HiOutlineShare className="w-6 h-6 text-indigo-500" />
                Social Media Links & Order Notification Alerts
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Admin New Order Notification Email
                  </label>
                  <div className="relative">
                    <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                    <input
                      type="email"
                      value={adminNotificationEmail}
                      onChange={(e) => setAdminNotificationEmail(e.target.value)}
                      placeholder="e.g. enderexclusive@gmail.com "
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 font-medium">
                    Receives email notifications automatically whenever a new customer order is placed.
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                      <FaInstagram className="w-4 h-4 text-pink-500" /> Instagram Profile
                    </label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-base font-medium text-zinc-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                      <FaFacebook className="w-4 h-4 text-blue-600" /> Facebook Page
                    </label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-base font-medium text-zinc-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                      <FaTiktok className="w-4 h-4 text-zinc-900 dark:text-white" /> TikTok Handle
                    </label>
                    <input
                      type="url"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="https://tiktok.com/@..."
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-base font-medium text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="flex items-center gap-3 cursor-pointer bg-zinc-100/70 dark:bg-[#18181B] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <input
                      type="checkbox"
                      checked={enableCod}
                      onChange={(e) => setEnableCod(e.target.value as any)}
                      className="w-5 h-5 text-amber-500 focus:ring-amber-400 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white block">
                        Enable Cash on Delivery (COD) Payment
                      </span>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Allow customers to choose COD during checkout
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: ADMIN PROFILE & SECURITY */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <HiOutlineShieldCheck className="w-6 h-6 text-purple-500" />
                Administrator Profile & Access Control
              </h2>

              <div className="p-6 bg-zinc-50/80 dark:bg-[#1A1A1A]/80 border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold text-xl flex items-center justify-center shadow-lg">
                    {adminUser?.displayName?.charAt(0) || adminUser?.email?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-zinc-900 dark:text-white">
                      {adminUser?.displayName || "System Administrator"}
                    </p>
                    <p className="text-sm font-mono text-zinc-400">{adminUser?.email || "admin@enderexclusive.com"}</p>
                  </div>

                  <span className="ml-auto px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                    Master Admin
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </form>
    </div>
  );
}
