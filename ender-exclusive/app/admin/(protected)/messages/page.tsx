"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Clock, Search, RefreshCw, CheckCircle2, MessageSquare, ExternalLink } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getContactMessages, ContactMessage } from "@/services/contactService";

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSubject, setFilterSubject] = useState("all");

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await getContactMessages();
            setMessages(data);
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filteredMessages = messages.filter((msg) => {
        const matchesSearch =
            msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (msg.phone && msg.phone.includes(searchQuery)) ||
            msg.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = filterSubject === "all" || msg.subject === filterSubject;
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="p-6 sm:p-10 max-w-[1600px] mx-auto space-y-8 text-white font-sans">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-amber-400" />
                        <span>Customer Inquiries & Messages</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1 font-semibold">
                        Manage contact form messages and customer inquiries in real time.
                    </p>
                </div>

                <button
                    onClick={fetchMessages}
                    disabled={loading}
                    className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-2 w-fit cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh Messages</span>
                </button>
            </div>

            {/* FILTERS AND SEARCH */}
            <div className="grid sm:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                    <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by customer name, email, phone, or message content..."
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 text-sm font-semibold outline-none focus:border-amber-400 transition"
                    />
                </div>

                {/* Subject Filter */}
                <div>
                    <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white font-semibold text-sm outline-none focus:border-amber-400 transition cursor-pointer"
                    >
                        <option value="all">All Inquiry Subjects ({messages.length})</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Order Status">Order Status & Tracking</option>
                        <option value="Custom Muay Thai Shorts">Custom Muay Thai Shorts</option>
                        <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                        <option value="Size Exchange">Size Exchange</option>
                    </select>
                </div>
            </div>

            {/* MESSAGES LIST */}
            {loading ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800/80 space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                    <p className="text-sm font-bold text-zinc-400">Loading messages from Firestore...</p>
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800/80 space-y-3">
                    <Mail className="w-12 h-12 text-zinc-600 mx-auto" />
                    <h3 className="text-lg font-black uppercase text-zinc-400">No Messages Found</h3>
                    <p className="text-xs text-zinc-500">
                        {searchQuery || filterSubject !== "all"
                            ? "No customer inquiries matched your current filter criteria."
                            : "No customer contact messages have been submitted yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMessages.map((msg) => {
                        const formattedDate = msg.createdAt?.toDate
                            ? msg.createdAt.toDate().toLocaleString()
                            : msg.createdAtIso
                                ? new Date(msg.createdAtIso).toLocaleString()
                                : "Unknown Date";

                        const cleanPhone = msg.phone ? msg.phone.replace(/[^0-9]/g, "") : "";

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition shadow-lg space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-black flex items-center justify-center text-base border border-amber-500/20">
                                            {msg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white">{msg.name}</h3>
                                            <p className="text-xs text-zinc-400 font-medium">{msg.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="px-3.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-black uppercase tracking-wider">
                                            {msg.subject}
                                        </span>
                                        <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formattedDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-sm text-zinc-200 font-medium leading-relaxed whitespace-pre-line">
                                    {msg.message}
                                </div>

                                {/* Quick Action Footer */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
                                        {msg.phone && (
                                            <span className="flex items-center gap-1.5 text-zinc-300">
                                                <Phone className="w-3.5 h-3.5 text-amber-400" />
                                                {msg.phone}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {cleanPhone && (
                                            <a
                                                href={`https://wa.me/${cleanPhone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5"
                                            >
                                                <FaWhatsapp className="w-4 h-4" />
                                                <span>WhatsApp Reply</span>
                                            </a>
                                        )}

                                        <a
                                            href={`mailto:${msg.email}?subject=RE: ${msg.subject} - Ender Exclusive`}
                                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span>Email Reply</span>
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
