"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineArrowsUpDown,
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
import { getProductById } from "@/services/productService";
import { getLookbookCollectionById } from "@/services/lookbookService";
import {
  saveLookbookProductStyle,
  getLookbookProductStyle,
} from "@/services/manualLookbookService";
import { Product } from "@/types/product";
import { LookBookCollection, LookBookProductStyle, MatchingItem } from "@/types/lookbook";

// --- Sortable Item Component ---
function SortableMatchingItem({
  item,
  onEdit,
  onDelete,
}: {
  item: MatchingItem;
  onEdit: (item: MatchingItem) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm mb-3 group hover:border-black transition-colors"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="p-2 cursor-grab text-zinc-400 hover:text-black touch-none"
      >
        <HiOutlineArrowsUpDown className="w-5 h-5" />
      </div>

      {/* Image */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
        <Image src={item.image} alt={item.title} fill className="object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 overflow-hidden">
        <h4 className="text-sm font-bold text-zinc-900 truncate">{item.title}</h4>
        <p className="text-xs text-zinc-500 line-clamp-1">{item.description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-zinc-400 hover:text-black transition rounded-lg hover:bg-zinc-100"
        >
          <HiOutlinePencilSquare className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-red-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}


// --- Main Page Component ---
export default function ManualLookbookEditor({
  params,
}: {
  params: Promise<{ collectionId: string; productId: string }>;
}) {
  const resolvedParams = use(params);
  const { collectionId, productId } = resolvedParams;
  const router = useRouter();

  const [collection, setCollection] = useState<LookBookCollection | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [items, setItems] = useState<MatchingItem[]>([]);
  const [styleNotes, setStyleNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MatchingItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [col, prod, styleDoc] = await Promise.all([
          getLookbookCollectionById(collectionId),
          getProductById(productId),
          getLookbookProductStyle(productId),
        ]);

        if (col) setCollection(col);
        if (prod) setProduct(prod);

        if (styleDoc) {
          if (styleDoc.matchingItems) {
            const sortedItems = [...styleDoc.matchingItems].sort((a, b) => a.displayOrder - b.displayOrder);
            setItems(sortedItems);
          }
          if (styleDoc.styleNotes) {
            setStyleNotes(styleDoc.styleNotes);
          }
        }
      } catch (err) {
        console.error("Error loading Lookbook editor:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [collectionId, productId]);

  // --- Drag and Drop Handlers ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        // Update displayOrders
        return newArray.map((item, idx) => ({ ...item, displayOrder: idx }));
      });
    }
  };

  // --- Save to Firestore ---
  const handleSaveLayout = async () => {
    setSaving(true);
    try {
      await saveLookbookProductStyle({
        collectionId,
        productId,
        matchingItems: items,
        styleNotes,
      });
      alert("Styling successfully saved!");
    } catch (err) {
      alert("Failed to save styling configuration.");
    } finally {
      setSaving(false);
    }
  };

  // --- Modal Handlers ---
  const openModalForAdd = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormDesc("");
    setFormImage("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (item: MatchingItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDesc(item.description);
    setFormImage(item.image);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to remove this item?")) {
      setItems((prev) => prev.filter((item) => item.id !== id).map((item, idx) => ({ ...item, displayOrder: idx })));
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formImage || !formDesc) {
      alert("Please fill in all fields.");
      return;
    }

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? { ...i, title: formTitle, description: formDesc, image: formImage }
            : i
        )
      );
    } else {
      const newItem: MatchingItem = {
        id: Math.random().toString(36).substr(2, 9), // Simple UUID
        title: formTitle,
        description: formDesc,
        image: formImage,
        displayOrder: items.length,
      };
      setItems((prev) => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ender-products"
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setFormImage(data.secure_url);
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image to Cloudinary.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-zinc-500 font-medium">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading manual styling editor...
      </div>
    );
  }

  if (!product || !collection) {
    return (
      <div className="p-16 text-center text-zinc-500">Product or Collection not found.</div>
    );
  }

  const mainImg = product.images?.[0] || product.colorImages?.[0]?.url || "";

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href={`/admin/lookbook/${collectionId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition mb-4"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to {collection.title}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Manual Styling Editor
          </h1>
          <p className="text-sm text-zinc-500">
            Create a custom "Complete The Look" guide for this specific product.
          </p>
        </div>
        <button
          onClick={handleSaveLayout}
          disabled={saving}
          className="px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition shadow-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Styling Layout"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Left Column: Main Product & Style Notes */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 flex flex-col items-center text-center sticky top-8 space-y-4">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden bg-zinc-200 shadow-md mb-2">
            <Image src={mainImg} alt={product.name} fill className="object-cover" />
          </div>
          <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
            Main Product
          </span>
          <h2 className="text-xl font-bold text-zinc-900 leading-tight">{product.name}</h2>
          <p className="text-xs text-zinc-500">{product.category}</p>

          <div className="w-full pt-4 border-t border-zinc-200 text-left space-y-2">
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Editorial Style Notes
            </label>
            <textarea
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
              placeholder="Write an editorial styling paragraph for this look..."
              rows={4}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:ring-2 focus:ring-black focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Right Column: Matching Items Editor */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
              Matching Items ({items.length})
            </h3>
            <button
              onClick={openModalForAdd}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition border border-zinc-200"
            >
              <HiOutlinePlus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-zinc-200 rounded-3xl text-center">
              <p className="text-zinc-500 font-medium mb-4">No matching items added yet.</p>
              <button
                onClick={openModalForAdd}
                className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition"
              >
                Add Your First Matching Item
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {items.map((item) => (
                    <SortableMatchingItem
                      key={item.id}
                      item={item}
                      onEdit={openModalForEdit}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-xl font-black text-zinc-900">
                {editingItem ? "Edit Matching Item" : "Add Matching Item"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Image Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">
                  Item Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                    {formImage ? (
                      <Image src={formImage} alt="Preview" fill className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">No Img</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-medium">OR</span>
                      <label className="cursor-pointer text-xs font-bold text-amber-600 hover:text-amber-700">
                        Upload to Cloudinary
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                      {uploadingImage && <span className="text-xs text-zinc-400">Uploading...</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. White Sneakers"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="e.g. Minimal white sneakers that create a modern casual outfit..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black resize-none"
                />
              </div>
            </form>

            <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition"
              >
                {editingItem ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
