import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaArrowRight,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-32">
      

      {/* Main Footer */}
      <div className="max-w-[1700px] mx-auto px-8 lg:px-12 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-14">
          {/* Brand */}
          <div>
            <h2 className="text-5xl font-black tracking-[0.15em]">ENDER</h2>

            <p className="tracking-[0.5em] text-xs text-gray-500 mt-2">
              EXCLUSIVE
            </p>

            <p className="mt-6 text-gray-400 leading-relaxed">
              Premium streetwear, fightwear and sportswear crafted for athletes,
              fighters and modern lifestyles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>

            <ul className="space-y-4 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Shop
                </Link>
              </li>

              <li>
                <Link href="/on-sale" className="hover:text-white transition">
                  On Sale
                </Link>
              </li>

              <li>
                <Link
                  href="/featured-looks"
                  className="hover:text-white transition"
                >
                  Featured Looks
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-6">Collections</h3>

            <ul className="space-y-4 text-gray-400">
              <li className="hover:text-white transition cursor-pointer">
                Men's Wear
              </li>

              <li className="hover:text-white transition cursor-pointer">
                Fight Wear
              </li>

              <li className="hover:text-white transition cursor-pointer">
                Sports Wear
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-xl font-bold mb-6">Connect</h3>

            <p className="text-gray-400 mb-3">info@enderexclusive.com</p>

            <p className="text-gray-400 mb-8">Colombo, Sri Lanka</p>

            <div className="flex gap-4">
              <a
                href="#"
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-gray-900
                  flex
                  items-center
                  justify-center
                  hover:bg-white
                  hover:text-black
                  transition
                "
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-gray-900
                  flex
                  items-center
                  justify-center
                  hover:bg-white
                  hover:text-black
                  transition
                "
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-gray-900
                  flex
                  items-center
                  justify-center
                  hover:bg-white
                  hover:text-black
                  transition
                "
              >
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1700px] mx-auto px-8 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Ender Exclusive. All Rights Reserved.
          </p>

          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#">Privacy Policy</Link>

            <Link href="#">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
