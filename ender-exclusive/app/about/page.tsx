import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <section className="text-center mb-24">
        <p className="uppercase tracking-[0.5em] text-gray-500 text-sm mb-4">
          Ender Exclusive
        </p>

        <h1 className="text-5xl md:text-7xl font-bold mb-6">About Us</h1>

        <p className="max-w-3xl mx-auto text-gray-600 text-lg">
          More than a clothing brand. Ender Exclusive represents confidence,
          discipline, performance and modern style.
        </p>
      </section>

      {/* Brand Story */}
      <section className="grid lg:grid-cols-2 gap-12 items-center mb-24">
        <div className="h-[500px] rounded-3xl bg-gradient-to-br from-black via-gray-900 to-gray-700" />

        <div>
          <p className="uppercase tracking-[0.3em] text-gray-500 text-sm mb-4">
            Our Story
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built For Those Who Stand Out
          </h2>

          <p className="text-gray-600 leading-8 mb-6">
            Ender Exclusive was created to bring together premium streetwear,
            fightwear and sportswear under one identity. Our goal is to provide
            high-quality apparel that combines comfort, performance and style.
          </p>

          <p className="text-gray-600 leading-8">
            Whether you're training, competing or expressing your everyday
            style, Ender Exclusive is designed to help you perform with
            confidence.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-24">
        <div className="text-center mb-14">
          <p className="uppercase tracking-[0.3em] text-gray-500 text-sm mb-4">
            What We Believe
          </p>

          <h2 className="text-4xl md:text-5xl font-bold">Our Core Values</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-2xl font-bold mb-4">Quality</h3>

            <p className="text-gray-600">
              Premium materials and attention to detail in every product.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-2xl font-bold mb-4">Performance</h3>

            <p className="text-gray-600">
              Designed for athletes, fighters and active lifestyles.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-2xl font-bold mb-4">Style</h3>

            <p className="text-gray-600">
              Modern fashion inspired by confidence and individuality.
            </p>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="mb-24">
        <div className="text-center mb-14">
          <p className="uppercase tracking-[0.3em] text-gray-500 text-sm mb-4">
            Collections
          </p>

          <h2 className="text-4xl md:text-5xl font-bold">What We Offer</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="h-[280px] rounded-3xl bg-black text-white flex items-center justify-center text-3xl font-bold">
            Streetwear
          </div>

          <div className="h-[280px] rounded-3xl bg-gray-800 text-white flex items-center justify-center text-3xl font-bold">
            Fightwear
          </div>

          <div className="h-[280px] rounded-3xl bg-gray-700 text-white flex items-center justify-center text-3xl font-bold">
            Sportswear
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-black text-white rounded-3xl p-12">
        <p className="uppercase tracking-[0.3em] text-gray-400 text-sm mb-4">
          Join The Movement
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mb-6">Wear Confidence</h2>

        <p className="max-w-2xl mx-auto text-gray-300 mb-8">
          Discover premium apparel designed for performance, confidence and
          style.
        </p>

        <Link
          href="/shop"
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition"
        >
          Shop Now
          <FiArrowRight />
        </Link>
      </section>
    </main>
  );
}
