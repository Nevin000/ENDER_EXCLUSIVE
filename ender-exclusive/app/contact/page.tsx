"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "General Inquiry",
          message: "",
        });
      }, 800);
    }
  };

  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300">
      
      {/* ===== 1. HERO SECTION (Premium Gray Theme) ===== */}
      <section className="relative bg-zinc-100 dark:bg-[#121212] text-zinc-900 dark:text-white py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
        {/* Subtle Ambient Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Small Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            <span>GET IN TOUCH WITH US</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight"
          >
            Contact <span className="text-amber-500">ENDER</span>
          </motion.h1>

          {/* Supporting Sub-Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-3 text-2xl sm:text-3xl font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider"
          >
            We're Here To Help
          </motion.h2>

          {/* Hero Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-zinc-600 dark:text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Have a question about an order, custom Muay Thai gear, sizing, or wholesale distribution? Our dedicated customer service team is available 24/7.
          </motion.p>
        </div>
      </section>

      {/* ===== 2. MAIN CONTENT SECTION ===== */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top 3 Info Cards Grid */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            
            {/* EMAIL CARD */}
            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-lg hover:border-amber-500/50 transition">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-5">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase mb-1">Email Us</h3>
              <p className="text-xs text-zinc-500 mb-3 font-semibold">Direct Customer Support</p>
              <a
                href="mailto:enderexclusive@gmail.com"
                className="text-base font-bold text-amber-600 dark:text-amber-400 hover:underline block break-all"
              >
                enderexclusive@gmail.com
              </a>
            </div>

            {/* PHONE & WHATSAPP CARD */}
            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-lg hover:border-amber-500/50 transition">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit mb-5">
                <FaWhatsapp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase mb-1">Phone & WhatsApp</h3>
              <p className="text-xs text-zinc-500 mb-3 font-semibold">24/7 Direct Ordering</p>
              <a
                href="https://wa.me/94701813098"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-emerald-600 dark:text-emerald-400 hover:underline block"
              >
                +94 70 181 3098
              </a>
            </div>

            {/* WAREHOUSE ADDRESS CARD */}
            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-lg hover:border-amber-500/50 transition">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 w-fit mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase mb-1">Warehouse Address</h3>
              <p className="text-xs text-zinc-500 mb-3 font-semibold">HQ & Dispatch Hub</p>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Ender Warehouse, 26/20, Gemunu Road, Attidiya, Dehiwala, 10350, Sri Lanka
              </p>
            </div>

          </div>

          {/* Form & Map 2-Column Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* LEFT: WORKING INTERACTIVE CONTACT FORM */}
            <div className="p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <div className="mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tight">Send Us A Message</h2>
                <p className="text-sm text-zinc-500 mt-2 font-medium">
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
                    <h4 className="text-lg font-black uppercase">Message Sent Successfully!</h4>
                  </div>
                  <p className="text-sm text-emerald-200 font-medium leading-relaxed">
                    Thank you for reaching out to Ender Exclusive. We have received your message and will respond shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs font-black uppercase tracking-wider text-emerald-400 underline cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3.5 bg-white dark:bg-[#18181B] border border-zinc-300 dark:border-zinc-700/80 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 font-medium outline-none focus:border-amber-500 transition text-sm"
                    />
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="enderexclusive@gmail.com"
                        className="w-full px-4 py-3.5 bg-white dark:bg-[#18181B] border border-zinc-300 dark:border-zinc-700/80 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 font-medium outline-none focus:border-amber-500 transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+94 70 181 3098"
                        className="w-full px-4 py-3.5 bg-white dark:bg-[#18181B] border border-zinc-300 dark:border-zinc-700/80 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 font-medium outline-none focus:border-amber-500 transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                      Inquiry Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white dark:bg-[#18181B] border border-zinc-300 dark:border-zinc-700/80 rounded-2xl text-zinc-900 dark:text-white font-medium outline-none focus:border-amber-500 transition text-sm"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Status">Order Status & Tracking</option>
                      <option value="Custom Muay Thai Shorts">Custom Muay Thai Shorts</option>
                      <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                      <option value="Size Exchange">Size Exchange</option>
                    </select>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full px-4 py-3.5 bg-white dark:bg-[#18181B] border border-zinc-300 dark:border-zinc-700/80 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 font-medium outline-none focus:border-amber-500 transition text-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT: INTERACTIVE GOOGLE MAP EMBED & WAREHOUSE LOCATION */}
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase">Ender Warehouse Location</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-semibold">Dehiwala, Sri Lanka</p>
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-mono font-bold">
                    ACTIVE HUB
                  </span>
                </div>

                {/* Google Map Embed centered on Attidiya, Dehiwala, Sri Lanka */}
                <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-md">
                  <iframe
                    title="Ender Warehouse Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757833075253!2d79.8755675!3d6.8450123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25a58e65ef5e9%3A0x6b44a0e1c2d0f52b!2sAttidiya%2C%20Dehiwala-Mount%20Lavinia!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-semibold space-y-1">
                  <p>📍 <strong>Address:</strong> Ender Warehouse, 26/20, Gemunu Road, Attidiya, Dehiwala, 10350, Sri Lanka</p>
                  <p>⏰ <strong>Warehouse Hours:</strong> Monday – Saturday: 9:00 AM – 6:00 PM</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}