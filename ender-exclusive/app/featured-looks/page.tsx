import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function FeaturedLooksPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <p className="uppercase tracking-[0.5em] text-gray-500 text-sm mb-4">
          Ender Exclusive
        </p>

        <h1 className="text-5xl md:text-7xl font-bold mb-6">Featured Looks</h1>

        <p className="max-w-2xl mx-auto text-gray-600 text-lg">
          Explore our exclusive fighter collections and premium lookbook
          showcasing the Ender Exclusive lifestyle.
        </p>
      </section>

      {/* Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fighters */}
        <Link href="/featured-looks/fighters" className="group">
          <div
            className="
              relative
              h-[500px]
              overflow-hidden
              rounded-3xl
              bg-gradient-to-br
              from-black
              via-gray-900
              to-gray-800
              p-10
              flex
              flex-col
              justify-end
              hover:-translate-y-2
              hover:shadow-2xl
              transition-all
              duration-500
            "
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-500" />

            <div className="relative z-10 text-white">
              <p className="uppercase tracking-[0.3em] text-xs text-gray-400 mb-4">
                Ender Exclusive
              </p>

              <h2 className="text-5xl md:text-6xl font-bold mb-4">Fighters</h2>

              <p className="text-gray-300 mb-8 max-w-md">
                Discover elite fighters wearing Ender Exclusive gear designed
                for performance and confidence.
              </p>

              <div className="flex items-center gap-3 font-medium">
                Explore Collection
                <FiArrowRight className="group-hover:translate-x-2 transition" />
              </div>
            </div>
          </div>
        </Link>

        {/* Lookbook */}
        <Link href="/featured-looks/lookbook" className="group">
          <div
            className="
              relative
              h-[500px]
              overflow-hidden
              rounded-3xl
              bg-gradient-to-br
              from-gray-900
              via-gray-700
              to-gray-500
              p-10
              flex
              flex-col
              justify-end
              hover:-translate-y-2
              hover:shadow-2xl
              transition-all
              duration-500
            "
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500" />

            <div className="relative z-10 text-white">
              <p className="uppercase tracking-[0.3em] text-xs text-gray-300 mb-4">
                Ender Exclusive
              </p>

              <h2 className="text-5xl md:text-6xl font-bold mb-4">Look Book</h2>

              <p className="text-gray-200 mb-8 max-w-md">
                Explore fashion editorials, lifestyle shoots and premium styling
                inspiration.
              </p>

              <div className="flex items-center gap-3 font-medium">
                View Gallery
                <FiArrowRight className="group-hover:translate-x-2 transition" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Bottom Quote */}
      <section className="text-center mt-20">
        <p className="uppercase tracking-[0.3em] text-gray-500 text-sm mb-4">
          Ender Exclusive
        </p>

        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Performance Meets Style
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto">
          From elite fighters to everyday streetwear enthusiasts, Ender
          Exclusive creates looks that stand out.
        </p>
      </section>
    </main>
  );
}
