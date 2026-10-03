"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import { createProduct } from "@/services/productService";

import {
  HiOutlinePhoto,
  HiPlus,
  HiTrash,
  HiXMark,
  HiArrowsPointingOut,
  HiOutlineTruck,
} from "react-icons/hi2";
import { Flame } from "lucide-react";

interface VariantImageItem {
  file: File | null;
  preview: string | null;
}

interface VariantFormState {
  color: string;
  images: VariantImageItem[];
  sizes: {
    size: string;
    stock: number;
  }[];
}

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("mens");
  const [description, setDescription] = useState("");
  const [totalStock, setTotalStock] = useState(0);

  const [loading, setLoading] = useState(false);

  // Delivery options
  const [deliveryType, setDeliveryType] = useState<"free" | "charge">("free");
  const [deliveryCharge, setDeliveryCharge] = useState("");

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Product variants with multiple photos per color
  const [productVariants, setProductVariants] = useState<VariantFormState[]>([
    {
      color: "No Color",
      images: [],
      sizes: [
        {
          size: "",
          stock: 0,
        },
      ],
    },
  ]);

  const [isOnSale, setIsOnSale] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("");

  // Expanded color palette
  const availableColors = [
    "No Color",
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Gray",
    "Navy",
    "Burgundy",
    "Forest Green",
    "Charcoal",
    "Beige",
    "Cream",
    "Olive",
    "Teal",
    "Coral",
    "Lavender",
    "Mustard",
    "Rose Gold",
    "Silver",
    "Brown",
    "Khaki",
    "Peach",
    "Mint",
  ];

  // Size options
  const sizeOptions = [
    {
      type: "Letter Sizes",
      sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    },
    {
      type: "Number Sizes (Waist)",
      sizes: ["26", "28", "30", "32", "34", "36", "38", "40", "42", "44"],
    },
    { type: "Number Sizes (Length)", sizes: ["30", "32", "34", "36", "38"] },
  ];

  const salePrice =
    isOnSale && discountPercentage && price
      ? Number(price) - (Number(price) * Number(discountPercentage)) / 100
      : Number(price);

  // Calculate total stock from all variants
  useEffect(() => {
    const total = productVariants.reduce((sum, variant) => {
      const variantTotal = variant.sizes.reduce((sizeSum, sizeItem) => {
        const stockValue =
          typeof sizeItem.stock === "string"
            ? parseInt(sizeItem.stock) || 0
            : sizeItem.stock || 0;
        return sizeSum + stockValue;
      }, 0);
      return sum + variantTotal;
    }, 0);
    setTotalStock(total);
  }, [productVariants]);

  // Handle multi-image selection for a variant with deduplication & input reset
  const handleVariantImagesUpload = (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const existingKeys = new Set(
      productVariants[variantIndex].images
        .filter((img) => img.file)
        .map((img) => `${img.file!.name}_${img.file!.size}`)
    );

    const newItems: VariantImageItem[] = [];
    Array.from(files).forEach((file) => {
      const key = `${file.name}_${file.size}`;
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        newItems.push({
          file,
          preview: URL.createObjectURL(file),
        });
      }
    });

    e.target.value = ""; // Reset input value to prevent duplicate change events

    if (newItems.length > 0) {
      setProductVariants((prev) => {
        const updated = [...prev];
        updated[variantIndex] = {
          ...updated[variantIndex],
          images: [...updated[variantIndex].images, ...newItems],
        };
        return updated;
      });
    }
  };

  // Remove individual photo from a variant
  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setProductVariants((prev) => {
      const updated = [...prev];
      const target = updated[variantIndex].images[imageIndex];
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      updated[variantIndex].images.splice(imageIndex, 1);
      return updated;
    });
  };

  const addVariantField = () => {
    setProductVariants((prev) => [
      ...prev,
      {
        color: "No Color",
        images: [],
        sizes: [{ size: "", stock: 0 }],
      },
    ]);
  };

  const removeVariantField = (index: number) => {
    setProductVariants((prev) => {
      const updated = [...prev];
      updated[index].images.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      updated.splice(index, 1);
      return updated;
    });
  };

  const addSizeField = (variantIndex: number) => {
    setProductVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].sizes.push({ size: "", stock: 0 });
      return updated;
    });
  };

  const removeSizeField = (variantIndex: number, sizeIndex: number) => {
    setProductVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].sizes.splice(sizeIndex, 1);
      return updated;
    });
  };

  const updateSizeField = (
    variantIndex: number,
    sizeIndex: number,
    field: string,
    value: string,
  ) => {
    setProductVariants((prev) => {
      const updated = [...prev];
      if (field === "size") {
        updated[variantIndex].sizes[sizeIndex].size = value;
      } else if (field === "stock") {
        const numericValue = value === "" ? 0 : parseInt(value);
        updated[variantIndex].sizes[sizeIndex].stock = isNaN(numericValue)
          ? 0
          : numericValue;
      }
      return updated;
    });
  };

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImagePreview = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
  };

  const getVariantTotalStock = (sizes: any[]) => {
    return sizes.reduce((sum, item) => {
      const stockValue =
        typeof item.stock === "string"
          ? parseInt(item.stock) || 0
          : item.stock || 0;
      return sum + stockValue;
    }, 0);
  };

  const handleAddProduct = async () => {
    try {
      if (!name || !price || !description) {
        alert("Please fill all basic product details");
        return;
      }

      const hasImages = productVariants.some((v) => v.images.length > 0);
      if (!hasImages) {
        alert("Please upload at least one image for a product variant");
        return;
      }

      if (
        deliveryType === "charge" &&
        (!deliveryCharge || Number(deliveryCharge) <= 0)
      ) {
        alert("Please enter a valid delivery charge amount");
        return;
      }

      const hasValidSizes = productVariants.every(
        (variant) =>
          variant.images.length === 0 || variant.sizes.some((s) => s.size && s.stock > 0),
      );

      if (!hasValidSizes) {
        alert("Please add at least one size with stock for each active variant");
        return;
      }

      setLoading(true);

      const colorVariantsData = [];
      const allColorImages: Array<{ color: string; url: string }> = [];
      const allSizes: Array<{ color: string; size: string; stock: number }> = [];
      const allImagesFlat: string[] = [];

      for (const variant of productVariants) {
        if (variant.images.length > 0) {
          const variantColor = variant.color === "No Color" ? "" : variant.color;

          // Upload all images for this color
          const imageUrls: string[] = [];
          for (const imgItem of variant.images) {
            if (imgItem.file) {
              const uploadedUrl = await uploadImageToCloudinary(imgItem.file);
              imageUrls.push(uploadedUrl);
              allImagesFlat.push(uploadedUrl);
              allColorImages.push({ color: variantColor, url: uploadedUrl });
            }
          }

          const validSizes = variant.sizes
            .filter((s) => s.size && s.stock > 0)
            .map((s) => ({
              color: variantColor,
              size: s.size,
              stock: s.stock,
            }));

          colorVariantsData.push({
            color: variantColor,
            imageUrl: imageUrls[0] || "",
            images: imageUrls,
            sizes: validSizes,
          });

          allSizes.push(...validSizes);
        }
      }

      const allColors = colorVariantsData.map((v) => v.color).filter(Boolean);

      await createProduct({
        name,
        price: Number(price),
        category,
        description,
        stock: totalStock,
        images: allImagesFlat,
        colorImages: allColorImages,
        colorVariants: colorVariantsData,
        colors: allColors,
        sizes: allSizes,
        isOnSale,
        discountPercentage: Number(discountPercentage || 0),
        salePrice,
        deliveryType,
        deliveryCharge: deliveryType === "charge" ? Number(deliveryCharge) : 0,
        status: "active",
      });

      alert("Product added successfully with multi-photo color galleries!");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full space-y-6 pb-20 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0D0D0D] border border-white/30 dark:border-[#2A2A2A]/50 shadow-2xl shadow-black/5 p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">
              <span>Portal</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span>Products</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-zinc-900 dark:text-white font-extrabold">Add</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              Add New <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Product</span>
            </h1>
            <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              Create a new product with multi-photo color galleries, size-wise stock, and delivery settings.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl shadow-xl shadow-black/5 overflow-hidden p-8 md:p-10 space-y-10">

        {/* Basic Details Grid */}
        <div className="grid lg:grid-cols-2 gap-8 gap-y-10">

          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                placeholder="e.g., Premium Oversized Heavyweight T-Shirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none transition-all shadow-inner"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Price (Rs.)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-amber-400 font-medium text-lg font-mono z-10 pointer-events-none">
                  Rs.
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-zinc-900 dark:text-white font-mono outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none cursor-pointer transition-all capitalize"
              >
                <option value="mens">Men's Wear</option>
                <option value="fightwear">Fight Wear</option>
                <option value="sportswear">Sports Wear</option>
              </select>
            </div>

            <div className="group">
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
                Delivery Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer bg-zinc-50/80 dark:bg-[#1A1A1A]/80 p-4 rounded-2xl border border-white/20 dark:border-zinc-800/60">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="free"
                    checked={deliveryType === "free"}
                    onChange={(e) => setDeliveryType(e.target.value as "free" | "charge")}
                    className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-base font-medium text-zinc-900 dark:text-white">Free Delivery</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full uppercase ml-auto">
                    Free
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer bg-zinc-50/80 dark:bg-[#1A1A1A]/80 p-4 rounded-2xl border border-white/20 dark:border-zinc-800/60">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="charge"
                    checked={deliveryType === "charge"}
                    onChange={(e) => setDeliveryType(e.target.value as "free" | "charge")}
                    className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-base font-medium text-zinc-900 dark:text-white">Custom Delivery Charge</span>
                </label>

                {deliveryType === "charge" && (
                  <div className="pt-2">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-amber-400 font-medium text-lg font-mono z-10 pointer-events-none">
                        Rs.
                      </span>
                      <input
                        type="number"
                        placeholder="Delivery Charge Amount"
                        value={deliveryCharge}
                        onChange={(e) => setDeliveryCharge(e.target.value)}
                        className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-3.5 text-lg font-medium text-zinc-900 dark:text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Product Description
              </label>
              <textarea
                rows={6}
                placeholder="Describe your product in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 backdrop-blur-sm border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-base font-medium text-zinc-900 dark:text-white outline-none resize-none transition-all shadow-inner"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Total Calculated Stock Quantity
              </label>
              <input
                type="text"
                value={`${totalStock} Units`}
                readOnly
                className="w-full bg-zinc-200/60 dark:bg-[#1A1A1A] border border-transparent rounded-2xl px-5 py-4 text-base font-medium text-zinc-900 dark:text-white font-mono cursor-not-allowed"
              />
            </div>

            {/* On Sale Promotional Card */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-base text-zinc-900 dark:text-white">
                    Promotional / On Sale Item
                  </span>
                  <p className="text-xs font-medium text-zinc-400 mt-0.5">
                    Enable promotional discount pricing
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isOnSale}
                  onChange={(e) => setIsOnSale(e.target.checked)}
                  className="w-5 h-5 text-amber-500 focus:ring-amber-400 rounded cursor-pointer"
                />
              </div>

              {isOnSale && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 20 for 20% OFF"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-base font-black text-zinc-900 dark:text-white font-mono outline-none"
                  />
                  <div className="flex justify-between text-sm font-bold font-mono pt-1">
                    <span className="text-zinc-400">Final Sale Price:</span>
                    <span className="text-emerald-500">Rs. {salePrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ===== MULTI-PHOTO COLOR VARIANTS SECTION ===== */}
        <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                Color Variants & Multi-Photo Galleries
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Upload multiple photos per color variant (e.g. Black T-shirt with front, back, and side photos).
              </p>
            </div>
            <button
              type="button"
              onClick={addVariantField}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-amber-400 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black transition-all shadow-md cursor-pointer shrink-0"
            >
              <HiPlus className="w-4 h-4" />
              <span>Add Color Variant</span>
            </button>
          </div>

          <div className="space-y-8">
            {productVariants.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className="group relative bg-zinc-50 dark:bg-[#141414] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 transition-all hover:border-amber-500/50 shadow-sm"
              >
                {productVariants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariantField(variantIndex)}
                    className="absolute top-4 right-4 bg-red-500/10 text-red-500 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition cursor-pointer"
                    title="Delete Variant"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                )}

                {/* Color Selection Header */}
                <div className="max-w-md">
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Variant Color Name
                  </label>
                  <select
                    value={variant.color}
                    onChange={(e) => {
                      const updated = [...productVariants];
                      updated[variantIndex].color = e.target.value;
                      setProductVariants(updated);
                    }}
                    className="w-full bg-white dark:bg-[#1A1A1A] border border-zinc-300 dark:border-zinc-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multi-Photo Upload Gallery */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Photos for "{variant.color || "This Variant"}" ({variant.images.length} uploaded)
                    </label>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      You can add multiple photos for this same color (Front, Back, Side view, etc.)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">

                    {/* Render Uploaded Image Thumbnails */}
                    {variant.images.map((imgItem, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="relative aspect-square bg-white dark:bg-[#1A1A1A] rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 group/img shadow-sm"
                      >
                        {imgItem.preview && (
                          <img
                            src={imgItem.preview}
                            alt={`Preview ${imgIdx}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => openImagePreview(imgItem.preview!)}
                          />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openImagePreview(imgItem.preview!)}
                            className="p-2 rounded-full bg-white text-black hover:scale-110 transition"
                          >
                            <HiArrowsPointingOut className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariantImage(variantIndex, imgIdx)}
                            className="p-2 rounded-full bg-red-600 text-white hover:scale-110 transition"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                        {imgIdx === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-400/30">
                            Cover Photo
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Add Photo Button */}
                    <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 transition cursor-pointer bg-white dark:bg-[#1A1A1A] text-center p-3">
                      <HiOutlinePhoto className="w-8 h-8 text-amber-500 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        + Add Photos
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleVariantImagesUpload(variantIndex, e)}
                      />
                    </label>

                  </div>
                </div>

                {/* Size & Stock Table */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Sizes & Inventory Stock for "{variant.color || "Standard"}"
                    </label>
                    <button
                      type="button"
                      onClick={() => addSizeField(variantIndex)}
                      className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <HiPlus className="w-3.5 h-3.5" />
                      <span>Add Size</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {variant.sizes.map((sizeItem, sizeIndex) => (
                      <div key={sizeIndex} className="flex gap-3 items-center">
                        <div className="flex-1">
                          <select
                            value={sizeItem.size}
                            onChange={(e) =>
                              updateSizeField(
                                variantIndex,
                                sizeIndex,
                                "size",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white dark:bg-[#1A1A1A] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-900 dark:text-white outline-none"
                          >
                            <option value="">Select Size</option>
                            {sizeOptions.map((group) => (
                              <optgroup key={group.type} label={group.type}>
                                {group.sizes.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Stock Units"
                            value={sizeItem.stock === 0 ? "" : sizeItem.stock}
                            onChange={(e) =>
                              updateSizeField(
                                variantIndex,
                                sizeIndex,
                                "stock",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white dark:bg-[#1A1A1A] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-900 dark:text-white outline-none"
                          />
                        </div>
                        {variant.sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSizeField(variantIndex, sizeIndex)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Submit CTA Button */}
          <div className="pt-6">
            <button
              onClick={handleAddProduct}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Uploading Photos & Creating Product..." : "🚀 Publish Product with Multi-Photo Color Galleries"}
            </button>
          </div>
        </div>

      </div>

      {/* Image Preview Modal */}
      {isModalOpen && previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={closeImagePreview}
              className="absolute -top-12 right-0 text-white p-2"
            >
              <HiXMark className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}