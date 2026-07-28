"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomerAccountGuard from "@/components/CustomerAccountGuard";
import { isAdminRoute, isCustomerAccountRoute } from "@/lib/authService";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin routes: render nothing — AdminLayout handles everything
  if (isAdminRoute(pathname)) {
    return <>{children}</>;
  }

  // Customer account routes (cart, checkout, orders, profile, wishlist)
  // Require active customer session — block admins and guests
  if (isCustomerAccountRoute(pathname)) {
    return (
      <CustomerAccountGuard>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </CustomerAccountGuard>
    );
  }

  // Public shop pages (homepage, shop, product pages, etc.)
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}