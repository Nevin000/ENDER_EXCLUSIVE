import Hero from "@/components/HomePage/Hero";
import Categories from "@/components/HomePage/Categories";
import NewArrivals from "@/components/HomePage/NewArrivals";
import FeaturedLooks from "@/components/HomePage/FeaturedLooks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <NewArrivals />
      <FeaturedLooks />
    </>
  );
}
