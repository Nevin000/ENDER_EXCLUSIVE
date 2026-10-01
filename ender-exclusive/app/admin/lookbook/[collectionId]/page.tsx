"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineCube,
  HiOutlineAdjustmentsHorizontal
} from "react-icons/hi2";
import {
  getLookbookCollectionById,
  updateLookbookCollection,
} from "@/services/lookbookService";
import { getProducts as fetchAllProducts } from "@/services/productService";
import { LookBookCollection } from "@/types/lookbook";
import { Product } from "@/types/product";

export default function AdminCollectionProductsPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const resolvedParams = use(params);
  const collectionId = resolvedParams.collectionId;

  const [collectionData, setCollectionData] = useState<LookBookCollection | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Selector Modal State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [col, products] = await Promise.all([
        getLookbookCollectionById(collectionId),
        fetchAllProducts(),
      ]);

      setCollectionData(col);
      setAllProducts(products);

      if (col && col.productIds) {
        const assigned = products.filter((p) => col.productIds.includes(p.id));
        setAssignedProducts(assigned);
        setSelectedProductIds(col.productIds);
      }
    } catch (err) {
      console.error("Error loading collection products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [collectionId]);

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSaveAssignedProducts = async () => {
    if (!collectionData) return;
    setIsSaving(true);
    try {
      await updateLookbookCollection(collectionData.id, {
        productIds: selectedProductIds,
      });

      const updatedAssigned = allProducts.filter((p) =>
        selectedProductIds.includes(p.id)
      );
      setAssignedProducts(updatedAssigned);
      setCollectionData({
        ...collectionData,
        productIds: selectedProductIds,
      });

      setPickerOpen(false);
    } catch (err) {
      console.error("Failed to update assigned products:", err);
      alert("Failed to save product assignments");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!collectionData) return;
    const newProductIds = (collectionData.productIds || []).filter(
      (id) => id !== productId
    );
    try {
      await updateLookbookCollection(collectionData.id, {
        productIds: newProductIds,
      });
      setCollectionData({ ...collectionData, productIds: newProductIds });
      setAssignedProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedProductIds(newProductIds);
    } catch (err) {
      console.error("Failed to remove product:", err);
    }
  };

  const filteredPickerProducts = allProducts.filter((p) => {
    const q = pickerSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.colors || []).join(" ").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="p-16 text-center text-zinc-500 font-medium">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading collection details...
      </div>
    );
  }

  if (!collectionData) {
    return (
      <div className="p-16 text-center text-zinc-500 space-y-4">
        <p className="text-xl font-bold text-zinc-900">Collection Not Found</p>
        <Link
          href="/admin/lookbook"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Look Book
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      {/* Back Button */}
      <Link
        href="/admin/lookbook"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white transition"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Collections
      </Link>

      {/* Hero Header */}
      <div className="relative rounded-3xl bg-zinc-950 text-white p-6 md:p-8 overflow-hidden shadow-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black rounded-full">
              {collectionData.gender}
            </span>
            {collectionData.status === "published" ? (
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                PUBLISHED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                DRAFT
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {collectionData.title}
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed">
            {collectionData.description || "No description provided."}
          </p>

          <p className="text-xs font-mono text-amber-400 pt-1">
            URL: /featured-looks/lookbook/{collectionData.slug}
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-black font-bold text-sm rounded-2xl hover:bg-zinc-200 transition shadow-xl"
          >
            <HiOutlinePlus className="w-5 h-5 text-black" />
            Assign Products ({assignedProducts.length})
          </button>
        </div>
      </div>

      {/* Assigned Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-900">
            Products in this Collection ({assignedProducts.length})
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Manage manual styling configurations for each product below.
          </p>
        </div>

        {assignedProducts.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-3xl border border-zinc-200 shadow-sm space-y-3">
            <HiOutlineCube className="w-12 h-12 mx-auto text-zinc-300" />
            <p className="text-lg font-bold text-zinc-900">No Products Assigned</p>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Select existing products from your store catalog to include them in this Look Book collection.
            </p>
            <button
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition"
            >
              <HiOutlinePlus className="w-4 h-4" /> Add Products Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assignedProducts.map((product) => {
              const mainImg =
                product.images?.[0] ||
                product.colorImages?.[0]?.url ||
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500";

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                    <Image
                      src={mainImg}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="p-2 bg-white/90 hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-full backdrop-blur-sm transition shadow-sm"
                        title="Remove from Collection"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {product.category || "Apparel"}
                      </p>
                      <h3 className="text-base font-bold text-zinc-900 group-hover:text-black line-clamp-1 mt-0.5">
                        {product.name}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <Link
                        href={`/admin/lookbook/${collectionData.id}/${product.id}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-black hover:text-amber-600 transition"
                      >
                        <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
                        Manage Styling
                      </Link>
                      <Link
                        href={`/featured-looks/lookbook/${collectionData.slug}/${product.slug || product.id}`}
                        target="_blank"
                        className="p-1.5 text-zinc-400 hover:text-black transition"
                        title="Preview Customer Page"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MULTI-SELECT PRODUCT PICKER MODAL */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPickerOpen(false)}
          />

          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden z-10 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="text-xl font-black text-zinc-900">Select Products</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Select existing products to assign to "{collectionData.title}"
                </p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-2 hover:bg-zinc-200 rounded-full text-zinc-500"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-zinc-100 bg-white">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search catalog by product name, category, or color..."
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPickerProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                const img =
                  p.images?.[0] ||
                  p.colorImages?.[0]?.url ||
                  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300";

                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleProduct(p.id)}
                    className={`cursor-pointer rounded-2xl p-3 border-2 transition-all flex items-center gap-3.5 ${isSelected
                        ? "border-black bg-zinc-50 shadow-md"
                        : "border-zinc-100 bg-white hover:border-zinc-300"
                      }`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      <Image src={img} alt={p.name} fill className="object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <HiOutlineCheck className="w-6 h-6 text-white font-black" />
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {p.category || "Apparel"}
                      </p>
                      <p className="text-sm font-bold text-zinc-900 truncate">{p.name}</p>
                      <p className="text-xs text-zinc-500 font-medium">
                        ${p.price || 0}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-600">
                {selectedProductIds.length} Products Selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignedProducts}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition shadow-md disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Product Assignments"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
