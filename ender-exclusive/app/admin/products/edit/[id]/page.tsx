"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getProductById, updateProduct } from "@/services/productService";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import type { Product } from "@/types/product";

import {
  HiOutlinePhoto,
  HiPlus,
  HiTrash,
  HiXMark,
  HiArrowsPointingOut,
  HiOutlineTruck,
} from "react-icons/hi2";
import { Flame } from "lucide-react";

interface VariantImageState {
  file: File | null;
  url: string;
  preview: string;
}

interface VariantState {
  color: string;
  images: VariantImageState[];
  sizes: { size: string; stock: number }[];
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Basic product info
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("mens");
  const [description, setDescription] = useState("");
  const [totalStock, setTotalStock] = useState(0);
  const [deliveryType, setDeliveryType] = useState<"free" | "charge">("free");
  const [deliveryCharge, setDeliveryCharge] = useState("");

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Product variants with multi-photo gallery support
  const [productVariants, setProductVariants] = useState<VariantState[]>([]);

  const [isOnSale, setIsOnSale] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("");

  const availableColors = [
    "No Color",
    "Black",
    "White",
    "Red",
    "Blue",
    "Navy",
    "Green",
    "Olive",
    "Yellow",
    "Orange",
    "Purple",
    "Pink",
    "Gray",
    "Silver",
    "Gold",
    "Beige",
    "Brown",
    "Maroon",
    "Teal",
    "Turquoise",
    "Multi-color",
  ];

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

  // Fetch product data on load
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        if (!data) {
          alert("Product not found");
          router.push("/admin/products");
          return;
        }

        setName(data.name || "");
        setPrice(data.price ? data.price.toString() : "");
        setCategory(data.category || "mens");
        setDescription(data.description || "");

        setDeliveryType(data.deliveryType || "free");
        setDeliveryCharge(data.deliveryCharge ? data.deliveryCharge.toString() : "");

        setIsOnSale(data.isOnSale || false);
        setDiscountPercentage(data.discountPercentage ? data.discountPercentage.toString() : "");

        const colorImages = data.colorImages || [];
        const colorVariants = data.colorVariants || [];
        const sizes = data.sizes || [];

        // Build variants with multi-photo support per color
        const variantsList: VariantState[] = [];

        if (colorVariants.length > 0) {
          colorVariants.forEach((cv) => {
            const variantSizes = sizes
              .filter((s) => (s as any).color === cv.color)
              .map((s) => ({ size: s.size, stock: s.stock }));

            // Gather all images for this color
            const imagesForColor: VariantImageState[] = [];
            
            // From cv.images array if available
            if (cv.images && cv.images.length > 0) {
              cv.images.forEach((url) => {
                imagesForColor.push({ file: null, url, preview: url });
              });
            } else if (cv.imageUrl) {
              imagesForColor.push({ file: null, url: cv.imageUrl, preview: cv.imageUrl });
            }

            // Also check colorImages array for any extra URLs for this color
            const matchingCI = colorImages.filter((ci) => ci.color === cv.color);
            matchingCI.forEach((ci) => {
              if (!imagesForColor.some((img) => img.url === ci.url)) {
                imagesForColor.push({ file: null, url: ci.url, preview: ci.url });
              }
            });

            variantsList.push({
              color: cv.color || "No Color",
              images: imagesForColor,
              sizes: variantSizes.length > 0 ? variantSizes : [{ size: "", stock: 0 }],
            });
          });
        } else if (colorImages.length > 0) {
          // Group by color
          const grouped = new Map<string, string[]>();
          colorImages.forEach((ci) => {
            const c = ci.color || "No Color";
            if (!grouped.has(c)) grouped.set(c, []);
            grouped.get(c)!.push(ci.url);
          });

          grouped.forEach((urls, colorName) => {
            const variantSizes = sizes
              .filter((s) => (s as any).color === colorName)
              .map((s) => ({ size: s.size, stock: s.stock }));

            variantsList.push({
              color: colorName,
              images: urls.map((url) => ({ file: null, url, preview: url })),
              sizes: variantSizes.length > 0 ? variantSizes : [{ size: "", stock: 0 }],
            });
          });
        } else {
          // Fallback single variant
          variantsList.push({
            color: data.colors?.[0] || "No Color",
            images: (data.images || []).map((url) => ({ file: null, url, preview: url })),
            sizes: [{ size: "", stock: 0 }],
          });
        }

        setProductVariants(variantsList);
      } catch (error) {
        console.error("Error loading product for edit:", error);
        alert("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  // Recalculate total stock across variants
  useEffect(() => {
    let sum = 0;
    productVariants.forEach((variant) => {
      variant.sizes.forEach((sizeItem) => {
        const val =
          typeof sizeItem.stock === "string"
            ? parseInt(sizeItem.stock) || 0
            : sizeItem.stock || 0;
        sum += val;
      });
    });
    setTotalStock(sum);
  }, [productVariants]);

  // Multi-image upload handler with deduplication and input reset
  const handleVariantImagesUpload = (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const existingKeys = new Set(
      productVariants[variantIndex].images.map((img) =>
        img.file ? `${img.file.name}_${img.file.size}` : img.url
      )
    );

    const newItems: VariantImageState[] = [];
    Array.from(files).forEach((file) => {
      const key = `${file.name}_${file.size}`;
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        newItems.push({
          file,
          url: "",
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

  // Remove photo from variant
  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setProductVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].images.splice(imageIndex, 1);
      return updated;
    });
  };

  const handleAddVariant = () => {
    setProductVariants((prev) => [
      ...prev,
      {
        color: "No Color",
        images: [],
        sizes: [{ size: "", stock: 0 }],
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (productVariants.length === 1) {
      alert("At least one variant is required");
      return;
    }
    setProductVariants((prev) => {
      const updated = [...prev];
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

  const salePrice =
    isOnSale && discountPercentage && price
      ? Number(price) - (Number(price) * Number(discountPercentage)) / 100
      : Number(price);

  // Submit Changes
  const handleUpdateProduct = async () => {
    try {
      if (!name || !price || !description) {
        alert("Please fill all required basic fields");
        return;
      }

      setSaving(true);

      const colorVariantsData = [];
      const allColorImages: Array<{ color: string; url: string }> = [];
      const allSizes: Array<{ color: string; size: string; stock: number }> = [];
      const allImagesFlat: string[] = [];

      for (const variant of productVariants) {
        if (variant.images.length > 0) {
          const variantColor = variant.color === "No Color" ? "" : variant.color;
          const imageUrls: string[] = [];

          for (const imgItem of variant.images) {
            if (imgItem.file) {
              const uploadedUrl = await uploadImageToCloudinary(imgItem.file);
              imageUrls.push(uploadedUrl);
              allImagesFlat.push(uploadedUrl);
              allColorImages.push({ color: variantColor, url: uploadedUrl });
            } else if (imgItem.url) {
              imageUrls.push(imgItem.url);
              allImagesFlat.push(imgItem.url);
              allColorImages.push({ color: variantColor, url: imgItem.url });
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

      const updatedProductData = {
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
        updatedAt: new Date().toISOString(),
      };

      await updateProduct(productId, updatedProductData);
      alert("Product updated successfully with multi-photo galleries!");
      router.push("/admin/products");

    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070707] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Loading Product Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-10 pb-36 font-sans selection:bg-amber-300 selection:text-black dark:selection:bg-amber-600 dark:selection:text-white">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0D0D0D] border border-white/30 dark:border-[#2A2A2A]/50 shadow-2xl p-8 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">
              <span>Portal</span>
              <span>/</span>
              <span>Products</span>
              <span>/</span>
              <span className="text-zinc-900 dark:text-white font-extrabold">Edit</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              Edit <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Product</span>
            </h1>
            <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mt-2">
              Update product details, multi-photo color galleries, sizes, and pricing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl border border-white/30 dark:border-[#2A2A2A]/60 rounded-3xl shadow-xl p-8 md:p-10 space-y-10">
        
        {/* Basic Fields Grid */}
        <div className="grid lg:grid-cols-2 gap-8 gap-y-10">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Price (Rs.)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-amber-400 font-medium text-lg font-mono">
                  Rs.
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 border border-transparent focus:border-amber-400/50 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-zinc-900 dark:text-white font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-lg font-medium text-zinc-900 dark:text-white outline-none cursor-pointer capitalize"
              >
                <option value="mens">Men's Wear</option>
                <option value="fightwear">Fight Wear</option>
                <option value="sportswear">Sports Wear</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
                Delivery Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer bg-zinc-50/80 dark:bg-[#1A1A1A]/80 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="free"
                    checked={deliveryType === "free"}
                    onChange={(e) => setDeliveryType(e.target.value as "free" | "charge")}
                    className="w-4 h-4 text-amber-500"
                  />
                  <span className="text-base font-medium text-zinc-900 dark:text-white">Free Delivery</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer bg-zinc-50/80 dark:bg-[#1A1A1A]/80 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="charge"
                    checked={deliveryType === "charge"}
                    onChange={(e) => setDeliveryType(e.target.value as "free" | "charge")}
                    className="w-4 h-4 text-amber-500"
                  />
                  <span className="text-base font-medium text-zinc-900 dark:text-white">Custom Delivery Charge</span>
                </label>

                {deliveryType === "charge" && (
                  <div className="pt-2 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-amber-400 font-medium text-lg font-mono">
                      Rs.
                    </span>
                    <input
                      type="number"
                      placeholder="Delivery Charge Amount"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 border border-transparent rounded-2xl pl-12 pr-5 py-3.5 text-lg font-medium text-zinc-900 dark:text-white font-mono outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Product Description
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-100/70 dark:bg-[#1A1A1A]/70 border border-transparent focus:border-amber-400/50 rounded-2xl px-5 py-4 text-base font-medium text-zinc-900 dark:text-white outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Total Stock Quantity
              </label>
              <input
                type="text"
                value={`${totalStock} Units`}
                readOnly
                className="w-full bg-zinc-200/60 dark:bg-[#1A1A1A] border border-transparent rounded-2xl px-5 py-4 text-base font-medium text-zinc-900 dark:text-white font-mono cursor-not-allowed"
              />
            </div>

            {/* On Sale Section */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-base text-zinc-900 dark:text-white">Promotional Item</span>
                  <p className="text-xs font-medium text-zinc-400 mt-0.5">Enable promotional sale pricing</p>
                </div>
                <input
                  type="checkbox"
                  checked={isOnSale}
                  onChange={(e) => setIsOnSale(e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded cursor-pointer"
                />
              </div>

              {isOnSale && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-black uppercase text-zinc-400">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-base font-black text-zinc-900 dark:text-white font-mono outline-none"
                  />
                  <div className="flex justify-between text-sm font-bold font-mono pt-1">
                    <span className="text-zinc-400">Sale Price:</span>
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
                Manage multiple photos per color variant (e.g. Black T-shirt with front, back, and detail photos).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
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
                    onClick={() => handleRemoveVariant(variantIndex)}
                    className="absolute top-4 right-4 bg-red-500/10 text-red-500 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition cursor-pointer"
                    title="Delete Variant"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                )}

                {/* Color Name Picker */}
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
                      Add multiple photos for this color (Front, Back, Side, Model shots)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
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
                            onClick={() => openImagePreview(imgItem.preview)}
                          />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openImagePreview(imgItem.preview)}
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

                {/* Size & Stock */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Sizes & Stock for "{variant.color || "Standard"}"
                    </label>
                    <button
                      type="button"
                      onClick={() => addSizeField(variantIndex)}
                      className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
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
                            onChange={(e) => updateSizeField(variantIndex, sizeIndex, "size", e.target.value)}
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
                            onChange={(e) => updateSizeField(variantIndex, sizeIndex, "stock", e.target.value)}
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

          {/* Submit Button */}
          <div className="pt-6">
            <button
              onClick={handleUpdateProduct}
              disabled={saving}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving Changes..." : "💾 Update Product & Multi-Photo Galleries"}
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
