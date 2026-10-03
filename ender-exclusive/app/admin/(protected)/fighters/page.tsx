"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  HiOutlineCloudArrowUp,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineArrowsUpDown,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineVideoCamera,
  HiOutlinePhoto,
  HiOutlinePlay,
} from "react-icons/hi2";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FighterImage } from "@/types/fighter";
import {
  getFighterImages,
  createFighterImagesBulk,
  updateFighterImagesOrder,
  updateFighterImageStatus,
  deleteFighterImage,
  bulkDeleteFighterImages,
  bulkUpdateFighterImagesStatus,
} from "@/services/fighterService";
import { uploadMediaToCloudinary } from "@/services/cloudinaryService";

// --- Sortable Gallery Item Component ---
function SortableImageRow({
  item,
  index,
  isSelected,
  onSelect,
  onToggleStatus,
  onDelete,
  onPreview,
}: {
  item: FighterImage;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleStatus: (id: string, current: "published" | "draft") => void;
  onDelete: (id: string) => void;
  onPreview: (item: FighterImage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isVideo = item.mediaType === "video";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between gap-4 p-4 bg-white dark:bg-[#121212] border rounded-2xl shadow-sm transition hover:border-black dark:hover:border-amber-500/50 ${isSelected
          ? "border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-500"
          : "border-zinc-200 dark:border-zinc-800"
        }`}
    >
      {/* Left: Drag Handle & Selection & Thumbnail */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-2 cursor-grab text-zinc-400 hover:text-black dark:hover:text-white touch-none shrink-0"
          title="Drag to reorder display position"
        >
          <HiOutlineArrowsUpDown className="w-5 h-5" />
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(item.id)}
          className="w-4 h-4 accent-black cursor-pointer rounded shrink-0"
        />

        {/* Thumbnail (Video or Image) */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0 border border-zinc-200 dark:border-zinc-800 group/thumb">
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                src={item.imageUrl}
                muted
                preload="metadata"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <HiOutlinePlay className="w-8 h-8 text-amber-400 drop-shadow-md" />
              </div>
            </div>
          ) : (
            <Image src={item.imageUrl} alt={`Gallery item ${index + 1}`} fill className="object-cover" />
          )}

          {/* Media Type Badge */}
          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-black/80 text-white backdrop-blur-sm">
            {isVideo ? "VIDEO" : "PHOTO"}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              Item #{index + 1}
            </p>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isVideo
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                }`}
            >
              {isVideo ? "Video" : "Photo"}
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
            {item.imageUrl}
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-semibold">
            Order Index: <span className="text-black dark:text-amber-400 font-bold">{item.displayOrder}</span>
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Status Toggle Badge */}
        <button
          type="button"
          onClick={() => onToggleStatus(item.id, item.status)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${item.status === "published"
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
            }`}
        >
          {item.status}
        </button>

        {/* Preview */}
        <button
          type="button"
          onClick={() => onPreview(item)}
          className="p-2 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          title="Preview Media"
        >
          <HiOutlineEye className="w-5 h-5" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
          title="Delete Item"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminFightersGalleryManager() {
  const [items, setItems] = useState<FighterImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processingBulk, setProcessingBulk] = useState(false);

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<FighterImage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchImagesList = async () => {
    setLoading(true);
    try {
      const data = await getFighterImages({
        status: statusFilter,
        mediaType: mediaTypeFilter,
      });
      setItems(data);
    } catch (err) {
      console.error("Failed to load fighter media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagesList();
  }, [statusFilter, mediaTypeFilter]);

  // Bulk Upload Handler (Videos & Images)
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadMediaToCloudinary(file));
      const mediaResults = await Promise.all(uploadPromises);
      await createFighterImagesBulk(mediaResults, "published");
      await fetchImagesList();
      alert(`Successfully uploaded ${mediaResults.length} media items to Cloudinary and Firestore!`);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Failed to upload media files: ${err?.message || "Unknown error"}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Drag and Drop Reorder Handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = items.findIndex((img) => img.id === active.id);
    const newIndex = items.findIndex((img) => img.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    setItems(reordered);

    try {
      await updateFighterImagesOrder(
        reordered.map((item) => ({ id: item.id, displayOrder: item.displayOrder }))
      );
    } catch (err) {
      console.error("Failed to persist reorder to Firestore:", err);
    }
  };

  // Single Item Handlers
  const handleToggleStatus = async (id: string, current: "published" | "draft") => {
    const nextStatus = current === "published" ? "draft" : "published";
    try {
      await updateFighterImageStatus(id, nextStatus);
      setItems((prev) => prev.map((img) => (img.id === id ? { ...img, status: nextStatus } : img)));
    } catch (err) {
      alert("Failed to toggle publication status.");
    }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      await deleteFighterImage(id);
      setItems((prev) => prev.filter((img) => img.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      alert("Failed to delete media item.");
    }
  };

  // Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map((img) => img.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;

    setProcessingBulk(true);
    try {
      await bulkDeleteFighterImages(selectedIds);
      setSelectedIds([]);
      await fetchImagesList();
      alert("Selected media items deleted successfully.");
    } catch (err) {
      alert("Failed to delete selected media items.");
    } finally {
      setProcessingBulk(false);
    }
  };

  const handleBulkStatusChange = async (targetStatus: "published" | "draft") => {
    if (selectedIds.length === 0) return;
    setProcessingBulk(true);
    try {
      await bulkUpdateFighterImagesStatus(selectedIds, targetStatus);
      setSelectedIds([]);
      await fetchImagesList();
    } catch (err) {
      alert(`Failed to update status to ${targetStatus}.`);
    } finally {
      setProcessingBulk(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      {/* Top Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0D0D0D] border border-white/30 dark:border-[#2A2A2A]/50 shadow-2xl shadow-black/5 p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">
              <span>Featured Look</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-zinc-900 dark:text-white font-extrabold">Fighters Showcase</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
              Fighters <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Showcase</span>
            </h1>
            <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              Upload both videos and images, drag-and-drop to reorder, filter media types, and manage published showcase content.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchImagesList()}
              className="p-4 bg-zinc-100/80 dark:bg-[#1A1A1A]/80 border border-white/20 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-2xl hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition cursor-pointer shadow-sm"
              title="Refresh List"
            >
              <HiOutlineArrowPath className="w-5 h-5" />
            </button>

            <label className="cursor-pointer flex items-center gap-2.5 px-7 py-4 bg-gradient-to-r from-zinc-900 to-black dark:from-white dark:to-zinc-200 text-white dark:text-black text-sm font-extrabold uppercase tracking-wider rounded-2xl hover:opacity-90 transition shadow-xl">
              <HiOutlineCloudArrowUp className="w-5 h-5 text-amber-400 dark:text-amber-600" />
              {uploading ? "Uploading..." : "Upload Photos & Videos"}
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleBulkUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Toolbar: Filters & Bulk Selection */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl p-6 shadow-xl shadow-black/5 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
                className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-black dark:focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>

            {/* Media Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                Type:
              </span>
              <div className="inline-flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${mediaTypeFilter === "all"
                      ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                    }`}
                >
                  All ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("image")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mediaTypeFilter === "image"
                      ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                    }`}
                >
                  <HiOutlinePhoto className="w-3.5 h-3.5" />
                  Photos
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("video")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${mediaTypeFilter === "video"
                      ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-black dark:hover:text-white"
                    }`}
                >
                  <HiOutlineVideoCamera className="w-3.5 h-3.5" />
                  Videos
                </button>
              </div>
            </div>
          </div>

          {/* Select All Checkbox */}
          {items.length > 0 && (
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={items.length > 0 && selectedIds.length === items.length}
                className="w-4 h-4 accent-black cursor-pointer rounded"
              />
              <span>Select All Items ({items.length})</span>
            </label>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-2xl animate-fadeIn">
            <span className="text-sm font-bold px-2">
              {selectedIds.length} Item{selectedIds.length === 1 ? "" : "s"} Selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange("published")}
                disabled={processingBulk}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Publish Selected
              </button>
              <button
                onClick={() => handleBulkStatusChange("draft")}
                disabled={processingBulk}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Unpublish Selected
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={processingBulk}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sortable Gallery List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-zinc-500 space-y-3 bg-white dark:bg-[#111111] border border-zinc-200 dark:border-[#2A2A2A] rounded-3xl">
            <div className="w-8 h-8 border-4 border-black dark:border-amber-500 border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Showcase Media...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center space-y-4 bg-white dark:bg-[#111111] border border-zinc-200 dark:border-[#2A2A2A] rounded-3xl">
            <HiOutlineCloudArrowUp className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
              No Gallery Media Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Upload high-definition photos or videos to populate the customer Fighters showcase page.
            </p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:opacity-90 transition">
              <HiOutlineCloudArrowUp className="w-4 h-4 text-amber-400 dark:text-amber-600" /> Upload Photos & Videos
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleBulkUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={items.map((img) => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {items.map((item, index) => (
                  <SortableImageRow
                    key={item.id}
                    item={item}
                    index={index}
                    isSelected={selectedIds.includes(item.id)}
                    onSelect={handleSelectOne}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteSingle}
                    onPreview={(mediaItem) => setPreviewItem(mediaItem)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Media Preview Modal (Videos & Images) */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-2 right-2 px-5 py-2.5 bg-white text-black text-xs font-black uppercase tracking-wider rounded-full shadow-2xl z-10 hover:bg-amber-400 transition cursor-pointer"
            >
              ✕ Close Preview
            </button>
            <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
              {previewItem.mediaType === "video" ? (
                <video
                  src={previewItem.imageUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
                />
              ) : (
                <Image src={previewItem.imageUrl} alt="Preview" fill className="object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
