import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-zinc-800/80 mt-0">
      {/* Main Footer Container (Matching Navbar padding & max-width) */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="inline-block group">
              <Image
                src="/images/ender_white_footer_logo.png"
                alt="Ender Exclusive"
                width={640}
                height={220}
                className="h-28 sm:h-36 md:h-40 lg:h-44 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-medium">
              Premium streetwear, fightwear, and sportswear crafted for athletes, fighters, and modern confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-6 text-white">Quick Navigation</h3>

            <ul className="space-y-4 text-zinc-300 font-semibold text-base sm:text-lg">
              <li>
                <Link href="/" className="hover:text-amber-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-amber-400 transition">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/on-sale" className="hover:text-red-500 transition font-extrabold text-red-500">
                  On Sale
                </Link>
              </li>
              <li>
                <Link href="/featured-looks" className="hover:text-amber-400 transition">
                  Featured Looks & Editorial
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition">
                  About Brand
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/return-and-exchange-policy-ender-wear" className="hover:text-amber-400 transition">
                  Return & Exchange Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-6 text-white">Collections</h3>

            <ul className="space-y-4 text-zinc-300 font-semibold text-base sm:text-lg">
              <li>
                <Link href="/shop/mens" className="hover:text-amber-400 transition">
                  Men's Streetwear
                </Link>
              </li>
              <li>
                <Link href="/shop/fightwear" className="hover:text-amber-400 transition">
                  Pro Combat Fight Wear
                </Link>
              </li>
              <li>
                <Link href="/shop/sportswear" className="hover:text-amber-400 transition">
                  Athletic Sports Wear
                </Link>
              </li>
              <li>
                <Link href="/featured-looks/fighters" className="hover:text-amber-400 transition">
                  Fighter Ambassadors
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-6 text-white">Connect & Orders</h3>

            <p className="text-white font-bold text-base sm:text-lg mb-2">enderexclusive@gmail.com</p>
            <p className="text-zinc-300 text-base sm:text-lg mb-5 font-medium leading-snug">
              Ender Warehouse, 26/20, Gemunu Road, Attidiya, Dehiwala, 10350, Sri Lanka
            </p>

            {/* WhatsApp Order Pill */}
            <a
              href="https://wa.me/94701813098"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-5 py-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 rounded-full text-emerald-400 text-sm sm:text-base font-black uppercase tracking-wider mb-6 transition shadow-lg"
            >
              <FaWhatsapp className="w-5 h-5 text-emerald-400" />
              <span>WhatsApp: +94 70 181 3098</span>
            </a>

            {/* Social Icons */}
            <div className="flex items-center gap-3.5">
              <a
                href="https://www.instagram.com/ender_exclusive/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#161616] border border-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-amber-400 hover:text-black transition duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>

              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#161616] border border-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-amber-400 hover:text-black transition duration-200"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-6 h-6" />
              </a>

              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#161616] border border-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-amber-400 hover:text-black transition duration-200"
                aria-label="TikTok"
              >
                <FaTiktok className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-zinc-800/80 bg-[#070707]">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-sm sm:text-base font-semibold">
            © 2026 Ender Exclusive. All Rights Reserved. Built for Champions.
          </p>

          <div className="flex items-center gap-6 text-sm sm:text-base font-bold text-zinc-400 flex-wrap">
            <Link href="/privacy" className="hover:text-zinc-200 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-200 transition">Terms & Conditions</Link>
            <Link href="/return-and-exchange-policy-ender-wear" className="hover:text-zinc-200 transition">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
