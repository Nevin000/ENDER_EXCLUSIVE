import type { Metadata } from "next";
import Link from "next/link";
import {
  RotateCcw,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Phone,
  PackageCheck,
  Truck,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Exchange Policy | Ender Wear",
  description:
    "Learn about Ender’s customer-friendly return and exchange policy. Easy returns within 14 days, clear terms for custom-made products, and fast resolutions for damaged or incorrect items.",
};

export default function ReturnAndExchangePolicyPage() {
  return (
    <main className="bg-white dark:bg-[#070707] text-zinc-900 dark:text-white min-h-screen transition-colors duration-300 pb-28">
      
      {/* ===== HERO BANNER SECTION ===== */}
      <section className="relative bg-[#070707] text-white py-16 sm:py-24 border-b border-zinc-800/80 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-[0.3em]">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>CUSTOMER ASSURANCE & TRANSPARENCY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight">
            Return & <span className="text-amber-400">Exchange Policy</span>
          </h1>

          <h2 className="text-xl sm:text-2xl font-extrabold uppercase text-amber-400 tracking-wider">
            Ender Wear Official Customer Guarantee
          </h2>

          <p className="max-w-3xl mx-auto text-zinc-300 text-base sm:text-lg font-medium leading-relaxed">
            At ENDER, we are committed to ensuring your total satisfaction with every purchase. If you are not entirely pleased with your order, we are here to assist you through our straightforward 14-day return and exchange process.
          </p>
        </div>
      </section>

      {/* ===== BREADCRUMB BAR ===== */}
      <div className="bg-zinc-50 dark:bg-[#111111] border-b border-zinc-200 dark:border-zinc-800 py-3.5">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-bold">Return & Exchange Policy</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-16">
        
        {/* Section 1: Core Terms & Eligibility Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: 14 Days Timeframe */}
          <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm hover:border-amber-500/50 transition-all duration-300">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">14-Day Timeframe</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              You have exactly <span className="font-bold text-zinc-900 dark:text-white">14 calendar days</span> from the date of delivery to initiate a return or size exchange request.
            </p>
          </div>

          {/* Card 2: Condition Eligibility */}
          <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm hover:border-amber-500/50 transition-all duration-300">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Original Condition</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Items must be unworn, unwashed, and in original condition with all original tags attached. Items with strong odors (smoke, cologne, detergent) or stains will not be accepted.
            </p>
          </div>

          {/* Card 3: Custom & Personalized Products */}
          <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm hover:border-amber-500/50 transition-all duration-300">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Customized Orders</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              All custom-made or personalized fightwear and embroidery items are final sale and cannot be returned or exchanged unless there is a verified manufacturing defect.
            </p>
          </div>

        </div>

        {/* Section 2: Damaged or Incorrect Items Support Box */}
        <div className="p-8 sm:p-12 rounded-3xl bg-amber-500/5 border border-amber-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500 text-black">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">IMMEDIATE RESOLUTION</span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Damaged or Incorrect Items</h3>
            </div>
          </div>

          <p className="text-base text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed max-w-4xl">
            If you receive a damaged, defective, or incorrect item in your delivery package, please contact our support team within <span className="font-bold text-zinc-900 dark:text-white">48 hours of delivery</span>. We will guide you through the return process and ensure that the issue is resolved promptly with priority replacement.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <a
              href="mailto:supportenderwear@gmail.com"
              className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-amber-500 transition group"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Email Support</span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">supportenderwear@gmail.com</span>
              </div>
            </a>

            <a
              href="tel:+94767213098"
              className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-amber-500 transition group"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Phone & Hotline</span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">+94 76 721 3098</span>
              </div>
            </a>
          </div>
        </div>

        {/* Section 3: Step-by-Step Return & Exchange Process */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">
              SIMPLE 6-STEP WORKFLOW
            </span>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Return & Exchange Process</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-2xl font-black text-amber-500 font-mono">01.</span>
              <h4 className="text-lg font-black uppercase tracking-tight">Contact Us</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                Reach out to our customer support team via email or phone to initiate your return or exchange request.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-2xl font-black text-amber-500 font-mono">02.</span>
              <h4 className="text-lg font-black uppercase tracking-tight">Prepare the Package</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                Ensure the item is in its original unworn condition, with all tags attached and original packaging intact.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-2xl font-black text-amber-500 font-mono">03.</span>
              <h4 className="text-lg font-black uppercase tracking-tight">Shipping</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                Use a registered or trackable courier service to send the item back to our central warehouse in Sri Lanka.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-2xl font-black text-amber-500 font-mono">04.</span>
              <h4 className="text-lg font-black uppercase tracking-tight">Inspection</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                Once we receive the returned item, our quality team inspects it to confirm eligibility under our policy.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-2xl font-black text-amber-500 font-mono">05.</span>
              <h4 className="text-lg font-black uppercase tracking-tight">Size or Color Exchanges</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                If you need a different size or color variant, our support team checks stock availability and dispatches the replacement.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-2xl font-black text-amber-500 font-mono">06.</span>
              <h4 className="text-lg font-black uppercase tracking-tight">Out-of-Stock Items</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                If the desired replacement item is out of stock, we issue an official store credit voucher valid for 12 full months.
              </p>
            </div>

          </div>
        </div>

        {/* Section 4: Bottom Callout */}
        <div className="p-10 rounded-3xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black uppercase">Need Help With Your Order?</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium max-w-xl mx-auto">
            Have questions about your recent purchase or need assistance with sizing? Our support team is ready to help.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest rounded-full transition shadow-xl hover:scale-105"
            >
              <span>Contact Customer Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </main>
  );
}
