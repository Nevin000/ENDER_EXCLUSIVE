import Hero from "@/components/HomePage/Hero";
import Categories from "@/components/HomePage/Categories";
import NewArrivals from "@/components/HomePage/NewArrivals";
import FeaturedLooks from "@/components/HomePage/FeaturedLooks";
import WhyChooseUs from "@/components/HomePage/WhyChooseUs";

export default function Home() {
  return (
    <main className="bg-[#070707]">
      <Hero />
      <Categories />
      <NewArrivals />
      <FeaturedLooks />
      <WhyChooseUs />
    </main>
  );
}
