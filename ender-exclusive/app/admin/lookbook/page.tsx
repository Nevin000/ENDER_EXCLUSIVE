"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/admin/AnimatedCounter";
import {
  HiOutlineSparkles,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineFolderOpen,
  HiOutlineCloudArrowUp,
  HiOutlineXMark,
  HiOutlineChevronRight,
  HiOutlineArrowPath,
  HiOutlineGlobeAlt,
  HiOutlineCube,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi2";
import {
  getLookbookCollections,
  createLookbookCollection,
  updateLookbookCollection,
  deleteLookbookCollection,
} from "@/services/lookbookService";
import { uploadImage } from "@/services/uploadService";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import { LookBookCollection } from "@/types/lookbook";

export default function AdminLookbookPage() {
  const [collections, setCollections] = useState<LookBookCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<LookBookCollection | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [gender, setGender] = useState<LookBookCollection["gender"]>("men");
  const [status, setStatus] = useState<LookBookCollection["status"]>("published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    const data = await getLookbookCollections();
    setCollections(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Summary KPI Calculations
  const kpiStats = useMemo(() => {
    const total = collections.length;
    const published = collections.filter((c) => c.status === "published").length;
    const draft = collections.filter((c) => c.status === "draft").length;
    const totalProducts = collections.reduce(
      (sum, c) => sum + (c.productIds?.length || 0),
      0
    );

    return { total, published, draft, totalProducts };
  }, [collections]);

  const openCreateModal = () => {
    setEditingCollection(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setGender("men");
    setStatus("published");
    setModalOpen(true);
  };

  const openEditModal = (col: LookBookCollection) => {
    setEditingCollection(col);
    setTitle(col.title);
    setSlug(col.slug);
    setDescription(col.description || "");
    setCoverImage(col.coverImage || "");
    setGender(col.gender);
    setStatus(col.status);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingCollection) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  // Robust Image Upload Functionality with Multi-tier Failover
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      let uploadedUrl = "";

      // Step 1: Attempt direct Cloudinary upload first (Fastest & primary storage)
      try {
        uploadedUrl = await uploadImageToCloudinary(file);
      } catch (cErr) {
        console.warn("Cloudinary upload failed, attempting Firebase Storage fallback...", cErr);
        // Step 2: Fallback to Firebase Storage
        try {
          uploadedUrl = await uploadImage(file);
        } catch (fbErr) {
          console.warn("Firebase Storage upload failed, converting to Data URL...", fbErr);
        }
      }

      // Step 3: Fallback to local Data URL preview if network uploads fail so user is never blocked
      if (!uploadedUrl) {
        uploadedUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Image upload failed. You can also paste a direct Image URL below.");
    } finally {
      setUploadingImage(false);
      e.target.value = ""; // Reset input so re-uploading the same file works
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-");

      const payload = {
        title: title.trim(),
        slug: generatedSlug,
        description: description.trim(),
        coverImage:
          coverImage.trim() ||
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80",
        gender,
        status,
        productIds: editingCollection ? editingCollection.productIds || [] : [],
      };

      if (editingCollection) {
        await updateLookbookCollection(editingCollection.id, payload);
      } else {
        await createLookbookCollection(payload);
      }

      setModalOpen(false);
      await fetchCollections();
    } catch (err) {
      console.error("Failed to save collection:", err);
      alert("Failed to save collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, colTitle: string) => {
    if (!confirm(`Are you sure you want to delete collection "${colTitle}"?`)) return;
    try {
      await deleteLookbookCollection(id);
      await fetchCollections();
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setGenderFilter("all");
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (genderFilter !== "all" ? 1 : 0);

  const filteredCollections = collections.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesGender = genderFilter === "all" || c.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesGender;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-10 pb-36 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      {/* ===== 1. HERO & HEADER BAR ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black dark:from-[#111111] dark:via-[#18181B] dark:to-[#0D0D0D] text-white border border-zinc-800 dark:border-[#2A2A2A]/50 shadow-2xl p-8 md:p-10">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-amber-400 mb-2">
              <span>Admin Portal</span>
              <HiOutlineChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-200">Look Book Collections</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
              Look Book <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Collections</span>
            </h1>
            <p className="text-sm md:text-base font-medium text-zinc-400 mt-2.5 max-w-2xl leading-relaxed">
              Group products into high-fashion editorial inspiration collections for storefront showcase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold rounded-2xl text-xs md:text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <HiOutlinePlus className="w-5 h-5 stroke-[2.5]" />
              <span>Create Collection</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== 2. KPI SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Total Collections */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
              Look Book
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Total Collections
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.total} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              Total created editorials
            </p>
          </div>
        </motion.div>

        {/* Published */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <HiOutlineGlobeAlt className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
              Published
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Published Collections
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.published} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              Live on storefront
            </p>
          </div>
        </motion.div>

        {/* Drafts */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <HiOutlineDocumentDuplicate className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              Draft
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Draft Collections
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.draft} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              Hidden from store
            </p>
          </div>
        </motion.div>

        {/* Total Products Assigned */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <HiOutlineCube className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
              Assigned
            </span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Assigned Products
            </p>
            <h2 className="text-2xl xl:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1 tracking-tight font-mono">
              <AnimatedCounter value={kpiStats.totalProducts} />
            </h2>
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 truncate">
              Total products grouped
            </p>
          </div>
        </motion.div>
      </div>

      {/* ===== 3. INTERACTIVE CONTROL BAR ===== */}
      <div className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-[360px]">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search collections by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 dark:focus:border-amber-400 rounded-2xl text-sm font-bold outline-none transition-all text-zinc-900 dark:text-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white p-1"
              >
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 rounded-2xl text-xs md:text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Visibility ({collections.length})</option>
              <option value="published">Published Only ({kpiStats.published})</option>
              <option value="draft">Drafts Only ({kpiStats.draft})</option>
            </select>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-3 bg-zinc-100/80 dark:bg-[#18181B] border border-transparent focus:border-amber-400 rounded-2xl text-xs md:text-sm font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="men">Men's</option>
              <option value="women">Women's</option>
              <option value="unisex">Unisex</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
              >
                <HiOutlineArrowPath className="w-4 h-4" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== 4. PRODUCTION LOOKBOOK TABLE (PRODUCT TABLE TYPOGRAPHY & SPACING) ===== */}
      <div className="bg-white dark:bg-[#111111] border border-zinc-200/80 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-zinc-400">Loading lookbook collections...</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-[#18181B] flex items-center justify-center mx-auto text-zinc-400">
              <HiOutlineFolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              No Collections Found
            </h3>
            <p className="text-sm font-medium text-zinc-400 max-w-md mx-auto">
              No lookbook collections match your current filter or search criteria.
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
            >
              Create New Collection
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Sticky Header */}
              <thead className="sticky top-0 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-200/80 dark:border-zinc-800 text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-5">Collection</th>
                  <th className="px-6 py-5">Target Gender</th>
                  <th className="px-6 py-5 text-center">Assigned Products</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Rows (Matching product table: text-base font-medium, not bold) */}
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-base font-medium text-zinc-900 dark:text-zinc-100">
                {filteredCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-zinc-50/80 dark:hover:bg-[#161618] transition-colors">
                    {/* Collection Info */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                          <Image
                            src={
                              col.coverImage ||
                              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300"
                            }
                            alt={col.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          {/* Title - font-medium (not bold) matching Product Table */}
                          <p className="font-medium text-zinc-900 dark:text-white text-base">{col.title}</p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                            /lookbook/{col.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Target Gender */}
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 text-xs font-semibold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                        {col.gender}
                      </span>
                    </td>

                    {/* Assigned Products Count */}
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-semibold text-xs rounded-full shadow-sm">
                        {col.productIds?.length || 0}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-5">
                      {col.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200/60 dark:border-emerald-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200/60 dark:border-amber-800/50">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/lookbook/${col.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold rounded-xl transition shadow-sm"
                        >
                          <HiOutlineFolderOpen className="w-4 h-4" />
                          Manage Products
                        </Link>
                        <button
                          onClick={() => openEditModal(col)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition cursor-pointer"
                          title="Edit Collection"
                        >
                          <HiOutlinePencilSquare className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(col.id, col.title)}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-rose-500 hover:text-rose-700 transition cursor-pointer"
                          title="Delete Collection"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== 5. CREATE / EDIT COLLECTION MODAL ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-zinc-200 dark:border-[#2A2A2A] overflow-hidden z-10 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-zinc-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-black">
                  {editingCollection ? "Edit Collection" : "Create New Collection"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Collection grouping for fashion products (e.g. Summer Polo Collection)
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                  Collection Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Summer Polo Collection"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#18181B] border border-zinc-200 dark:border-[#2A2A2A] rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. summer-polo-collection"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#18181B] border border-zinc-200 dark:border-[#2A2A2A] rounded-xl text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Inspiration notes about this collection..."
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#18181B] border border-zinc-200 dark:border-[#2A2A2A] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* COVER IMAGE UPLOAD & PREVIEW (FIXED & RELIABLE) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                  Collection Cover Image
                </label>

                {coverImage ? (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group">
                    <Image
                      src={coverImage}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-100 transition shadow-md">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition shadow-md cursor-pointer"
                        title="Remove Image"
                      >
                        <HiOutlineXMark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-400 rounded-2xl bg-zinc-50 dark:bg-[#18181B] transition cursor-pointer text-center group">
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Uploading Image...</span>
                      </div>
                    ) : (
                      <>
                        <HiOutlineCloudArrowUp className="w-10 h-10 text-zinc-400 group-hover:text-amber-400 transition" />
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-2">
                          Click to upload cover image file
                        </span>
                        <span className="text-xs text-zinc-400 mt-0.5">
                          PNG, JPG, WEBP supported
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}

                {/* Direct Image URL Backup Input */}
                <div className="pt-1">
                  <span className="text-[11px] text-zinc-400 font-medium block mb-1">
                    Or paste direct Image URL:
                  </span>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-[#18181B] border border-zinc-200 dark:border-[#2A2A2A] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Gender and Status Selects (Season removed) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                    Target Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as LookBookCollection["gender"])
                    }
                    className="w-full px-3 py-3 bg-zinc-50 dark:bg-[#18181B] border border-zinc-200 dark:border-[#2A2A2A] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="men">Men's</option>
                    <option value="women">Women's</option>
                    <option value="unisex">Unisex</option>
                    <option value="all">All Genders</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as LookBookCollection["status"])
                    }
                    className="w-full px-3 py-3 bg-zinc-50 dark:bg-[#18181B] border border-zinc-200 dark:border-[#2A2A2A] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingCollection
                    ? "Update Collection"
                    : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
