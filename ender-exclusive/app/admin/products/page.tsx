"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  getProducts,
  deleteProduct,
  getProductById,
} from "@/services/productService";

import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineChartBar,
  HiOutlineTag,
  HiOutlineCube,
  HiOutlineEye,
  HiXMark,
  HiOutlineTruck,
  HiOutlineShoppingBag,
  HiOutlinePhoto,
} from "react-icons/hi2";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for updated query parameter on page load
  useEffect(() => {
    const updated = searchParams.get("updated");
    if (updated === "true") {
      setToastMessage("Product updated successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      // Remove query parameter from URL without reload
      window.history.replaceState({}, "", "/admin/products");
    }
    fetchProducts();
  }, [searchParams, fetchProducts]);

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      await fetchProducts();
      setToastMessage("Product deleted successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  
  const handleViewProduct = async (product: any) => {
    try {
      
      const latestProduct = await getProductById(product.id);

      if (latestProduct) {
        setSelectedProduct(latestProduct);
        setIsModalOpen(true);
      } else {
        alert("Product not found");
      }
    } catch (error) {
      console.error("Failed to load product details:", error);
      alert("Failed to load product details");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImagePreview = () => {
    setIsImageModalOpen(false);
    setPreviewImage(null);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  const totalProducts = products.length;
  const totalInStock = products.filter(
    (product) => Number(product.stock) > 0,
  ).length;
  const totalOutOfStock = products.filter(
    (product) => Number(product.stock) <= 0,
  ).length;
  const totalOnSale = products.filter((product) => product.isOnSale).length;

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {toastMessage}
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-black/60 text-xs font-medium tracking-wide mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-black/40"></span>
            Product Management
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Products
              </h1>
              <p className="text-gray-500 mt-3 text-lg max-w-2xl">
                Manage your inventory, track stock levels, and control product
                pricing
              </p>
            </div>
            <Link
              href="/admin/products/add"
              className="group flex items-center gap-2 bg-linear-to-r from-gray-900 to-black text-white px-6 py-3.5 rounded-2xl font-semibold hover:from-black hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-fit"
            >
              <HiOutlinePlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <HiOutlineCube className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                {totalProducts}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Total Products</p>
            <p className="text-xs text-gray-400 mt-1">
              All products in catalog
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <HiOutlineChartBar className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-bold text-green-600">
                {totalInStock}
              </span>
            </div>
            <p className="text-gray-600 font-medium">In Stock</p>
            <p className="text-xs text-gray-400 mt-1">Available for purchase</p>
          </div>

          <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <HiOutlineChartBar className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-bold text-red-600">
                {totalOutOfStock}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Out of Stock</p>
            <p className="text-xs text-gray-400 mt-1">Need restocking</p>
          </div>

          <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <HiOutlineTag className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-bold text-orange-600">
                {totalOnSale}
              </span>
            </div>
            <p className="text-gray-600 font-medium">On Sale</p>
            <p className="text-xs text-gray-400 mt-1">Discounted products</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-14 pr-5 py-4 outline-none transition-all duration-200 focus:border-black focus:ring-2 focus:ring-black/10 text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineCube className="text-4xl text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Products Found
              </h2>
              <p className="text-gray-500 mb-6">
                {search
                  ? `No products matching "${search}"`
                  : "Get started by adding your first product"}
              </p>
              <Link
                href="/admin/products/add"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all"
              >
                <HiOutlinePlus className="text-lg" />
                Add Product
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
                    <th className="text-left p-5 font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="text-left p-5 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left p-5 font-semibold text-gray-700">
                      Colors
                    </th>
                    <th className="text-left p-5 font-semibold text-gray-700">
                      Sizes
                    </th>
                    <th className="text-left p-5 font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="text-left p-5 font-semibold text-gray-700">
                      Delivery
                    </th>
                    <th className="text-left p-5 font-semibold text-gray-700">
                      Stock
                    </th>
                    <th className="text-left p-5 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-center p-5 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => {
                    const inStock = Number(product.stock) > 0;
                    const isEven = index % 2 === 0;
                    return (
                      <tr
                        key={product.id}
                        className={`border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-200 ${
                          isEven ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={product.images?.[0] || "/placeholder.png"}
                                alt={product.name}
                                className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm"
                              />
                              {product.isOnSale && (
                                <div className="absolute -top-2 -right-2">
                                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    %
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 hover:text-black transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-400 font-mono mt-1">
                                #{product.id?.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-5">
                          <span className="capitalize px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                            {product.category || "N/A"}
                          </span>
                        </td>

                        <td className="p-5">
                          <div className="flex flex-wrap gap-1.5">
                            {product.colors && product.colors.length > 0 ? (
                              <>
                                {product.colors
                                  .slice(0, 3)
                                  .map((color: string, idx: number) => (
                                    <span
                                      key={`${color}-${idx}`}
                                      className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 capitalize font-medium"
                                    >
                                      {color}
                                    </span>
                                  ))}
                                {product.colors.length > 3 && (
                                  <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-500">
                                    +{product.colors.length - 3}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No colors
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex flex-wrap gap-1.5">
                            {product.sizes && product.sizes.length > 0 ? (
                              <>
                                {[
                                  ...new Map(
                                    product.sizes.map((item: any) => [
                                      item.size,
                                      item,
                                    ]),
                                  ).values(),
                                ]
                                  .slice(0, 3)
                                  .map((item: any, idx: number) => (
                                    <span
                                      key={`${item.size}-${idx}`}
                                      className="px-2 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 font-medium"
                                    >
                                      {item.size}
                                    </span>
                                  ))}
                                {[
                                  ...new Map(
                                    product.sizes.map((item: any) => [
                                      item.size,
                                      item,
                                    ]),
                                  ).values(),
                                ].length > 3 && (
                                  <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-500">
                                    +
                                    {[
                                      ...new Map(
                                        product.sizes.map((item: any) => [
                                          item.size,
                                          item,
                                        ]),
                                      ).values(),
                                    ].length - 3}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No sizes
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-5">
                          {product.isOnSale ? (
                            <div>
                              <p className="line-through text-gray-400 text-sm">
                                Rs. {product.price?.toLocaleString()}
                              </p>
                              <p className="font-bold text-red-600 text-lg">
                                Rs. {product.salePrice?.toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <p className="font-bold text-gray-800 text-lg">
                              Rs. {product.price?.toLocaleString()}
                            </p>
                          )}
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <HiOutlineTruck className="text-gray-400 text-sm" />
                            {product.deliveryType === "free" ? (
                              <span className="text-green-600 font-medium text-sm">
                                Free Delivery
                              </span>
                            ) : (
                              <span className="text-orange-600 font-medium text-sm">
                                Rs. {product.deliveryCharge?.toLocaleString()}{" "}
                                Delivery
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                inStock ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            <span
                              className={`font-semibold ${
                                inStock ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {product.stock || 0}
                            </span>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold w-fit ${
                                inStock
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {inStock ? "● Active" : "● Out of Stock"}
                            </span>
                            {product.isOnSale && (
                              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-100 text-orange-700 w-fit">
                                🔥 Sale -{product.discountPercentage}%
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="group w-10 h-10 rounded-xl bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-600 flex items-center justify-center transition-all duration-200"
                              title="View Product"
                            >
                              <HiOutlineEye className="text-lg group-hover:scale-110 transition-transform" />
                            </button>
                            <Link
                              href={`/admin/products/edit/${product.id}`}
                              className="group w-10 h-10 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center justify-center transition-all duration-200"
                              title="Edit Product"
                            >
                              <HiOutlinePencilSquare className="text-lg group-hover:scale-110 transition-transform" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="group w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 flex items-center justify-center transition-all duration-200"
                              title="Delete Product"
                            >
                              <HiOutlineTrash className="text-lg group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <div className="flex justify-between items-center text-sm">
                <p className="text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {filteredProducts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {products.length}
                  </span>{" "}
                  products
                </p>
                <p className="text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Modal - FIXED: Direct render without uniqueSizes filter */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete Product Details
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Basic Information Card */}
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Product ID
                      </label>
                      <p className="text-gray-800 font-mono mt-1 text-sm">
                        {selectedProduct.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Category
                      </label>
                      <p className="text-gray-800 capitalize mt-1">
                        {selectedProduct.category || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Delivery
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <HiOutlineTruck className="text-gray-500" />
                        {selectedProduct.deliveryType === "free" ? (
                          <span className="text-green-600 font-medium">
                            Free Delivery
                          </span>
                        ) : (
                          <span className="text-orange-600 font-medium">
                            Rs.{" "}
                            {selectedProduct.deliveryCharge?.toLocaleString()}{" "}
                            Delivery Charge
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Price
                      </label>
                      {selectedProduct.isOnSale ? (
                        <div className="mt-1">
                          <p className="line-through text-gray-400 text-sm">
                            Rs. {selectedProduct.price?.toLocaleString()}
                          </p>
                          <p className="text-3xl font-bold text-red-600">
                            Rs. {selectedProduct.salePrice?.toLocaleString()}
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            Save {selectedProduct.discountPercentage}%
                          </p>
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                          Rs. {selectedProduct.price?.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Total Stock
                      </label>
                      <p
                        className={`text-3xl font-bold mt-1 ${Number(selectedProduct.stock) > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {selectedProduct.stock || 0} units
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    {selectedProduct.description || "No description provided"}
                  </p>
                </div>
              </div>

              {/* Color Variants Section - FIXED: Merge sizes with latest stock */}
              {selectedProduct.colorVariants &&
              selectedProduct.colorVariants.length > 0 ? (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <HiOutlineShoppingBag className="text-gray-700 text-xl" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Color Variants
                    </h3>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {selectedProduct.colorVariants.length} Variants
                    </span>
                  </div>
                  <div className="space-y-6">
                    {selectedProduct.colorVariants.map(
                      (variant: any, idx: number) => {
                        // FIX: Merge sizes with same name but keep the latest stock (from database)
                        // This ensures we show the most up-to-date stock values
                        const mergedSizes = Object.values(
                          (variant.sizes || []).reduce(
                            (acc: any, item: any) => {
                              // If same size exists, overwrite with the latest (last one wins)
                              acc[item.size] = item;
                              return acc;
                            },
                            {},
                          ),
                        );

                        return (
                          <div
                            key={`variant-${idx}`}
                            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-200">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img
                                    src={variant.imageUrl}
                                    alt={variant.color || "Variant"}
                                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                                  />
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                  <h4 className="font-bold text-xl text-gray-800 capitalize">
                                    {variant.color || "Standard Edition"}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-sm text-gray-500">
                                      Total Stock:
                                      <span className="font-semibold text-green-600 ml-1">
                                        {mergedSizes.reduce(
                                          (sum: number, s: any) =>
                                            sum + (s.stock || 0),
                                          0,
                                        )}{" "}
                                        units
                                      </span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Sizes:
                                      <span className="font-semibold text-blue-600 ml-1">
                                        {mergedSizes.length}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="p-5">
                              {mergedSizes.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                  {mergedSizes.map(
                                    (sizeItem: any, sizeIdx: number) => (
                                      <div
                                        key={`size-${idx}-${sizeIdx}`}
                                        className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group"
                                      >
                                        <p className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                          {sizeItem.size}
                                        </p>
                                        <div className="mt-1 flex items-center justify-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                          <p className="text-sm font-semibold text-gray-700">
                                            {sizeItem.stock}{" "}
                                            <span className="text-xs text-gray-400 font-normal">
                                              units
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-400">
                                  No sizes available for this variant
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <HiOutlineShoppingBag className="text-gray-700 text-xl" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Size-wise Stock
                    </h3>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-200">
                      <h4 className="font-bold text-lg text-gray-800">
                        All Sizes
                      </h4>
                    </div>
                    <div className="p-5">
                      {selectedProduct.sizes &&
                      selectedProduct.sizes.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {selectedProduct.sizes.map(
                            (item: any, idx: number) => (
                              <div
                                key={`size-${idx}`}
                                className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group"
                              >
                                <p className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                  {item.size}
                                </p>
                                <div className="mt-1 flex items-center justify-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <p className="text-sm font-semibold text-gray-700">
                                    {item.stock} units
                                  </p>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          No size information available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Product Images Gallery */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <HiOutlinePhoto className="text-gray-700 text-xl" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Product Gallery
                    </h3>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {selectedProduct.images.length} Images
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {selectedProduct.images.map(
                      (image: string, idx: number) => (
                        <div
                          key={`gallery-${idx}`}
                          className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-all"
                          onClick={() => openImagePreview(image)}
                        >
                          <img
                            src={image}
                            alt={`${selectedProduct.name} - ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                            <HiOutlineEye className="text-white text-2xl" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            {idx + 1}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 pt-4">
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${Number(selectedProduct.stock) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {Number(selectedProduct.stock) > 0
                    ? "✓ In Stock"
                    : "✗ Out of Stock"}
                </span>
                {selectedProduct.isOnSale && (
                  <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-orange-100 text-orange-700">
                    🔥 On Sale - {selectedProduct.discountPercentage}% OFF
                  </span>
                )}
                <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-100 text-blue-700">
                  {selectedProduct.status || "Active"}
                </span>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <Link
                href={`/admin/products/edit/${selectedProduct.id}`}
                onClick={closeModal}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Product
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Preview Modal */}
      {isImageModalOpen && previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-6xl max-h-[90vh] mx-4">
            <button
              onClick={closeImagePreview}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
            >
              <HiXMark className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
