"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getProductById, updateProduct } from "@/services/productService";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import type { Product, ProductSize, ProductImage } from "@/types/product";

import {
  HiOutlinePhoto,
  HiPlus,
  HiTrash,
  HiXMark,
  HiArrowsPointingOut,
  HiOutlineTruck,
} from "react-icons/hi2";

interface VariantState {
  color: string;
  imageUrl: string;
  imageFile: File | null;
  preview: string | null;
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

  // Product variants with colors and sizes
  const [productVariants, setProductVariants] = useState<VariantState[]>([]);

  const [isOnSale, setIsOnSale] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [salePrice, setSalePrice] = useState(0);

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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = (await getProductById(productId)) as Product | null;

        if (!product) {
          alert("Product not found");
          router.push("/admin/products");
          return;
        }

        // Basic info
        setName(product.name || "");
        setPrice(product.price?.toString() || "");
        setCategory(product.category || "mens");
        setDescription(product.description || "");
        setIsOnSale(product.isOnSale || false);
        setDiscountPercentage(product.discountPercentage?.toString() || "");
        setDeliveryType(product.deliveryType || "free");
        setDeliveryCharge(product.deliveryCharge?.toString() || "");

        // Calculate sale price
        if (product.isOnSale && product.discountPercentage) {
          setSalePrice(
            product.salePrice ||
              product.price -
                (product.price * product.discountPercentage) / 100,
          );
        } else {
          setSalePrice(product.price || 0);
        }

        // Load variants from colorVariants (priority) or colorImages
        if (product.colorVariants && product.colorVariants.length > 0) {
          const variants: VariantState[] = product.colorVariants.map(
            (variant: any) => ({
              color: variant.color || "",
              imageUrl: variant.imageUrl,
              imageFile: null,
              preview: null,
              sizes: variant.sizes || [{ size: "", stock: 0 }],
            }),
          );
          setProductVariants(variants);
        } else if (product.colorImages && product.colorImages.length > 0) {
          // Fallback: Build variants from colorImages and match with sizes
          const sizesByColor: { [key: string]: any[] } = {};
          if (product.sizes && product.sizes.length > 0) {
            product.sizes.forEach((size: any) => {
              const colorKey = size.color || "";
              if (!sizesByColor[colorKey]) {
                sizesByColor[colorKey] = [];
              }
              sizesByColor[colorKey].push({
                size: size.size,
                stock: size.stock,
              });
            });
          }

          const variants: VariantState[] = product.colorImages.map(
            (colorImage: any) => {
              const colorKey = colorImage.color || "";
              return {
                color: colorImage.color || "",
                imageUrl: colorImage.url,
                imageFile: null,
                preview: null,
                sizes: sizesByColor[colorKey] || [{ size: "", stock: 0 }],
              };
            },
          );
          setProductVariants(variants);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, router]);

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

  // Update sale price when price or discount changes
  useEffect(() => {
    if (isOnSale && discountPercentage && price) {
      const calculatedSalePrice =
        Number(price) - (Number(price) * Number(discountPercentage)) / 100;
      setSalePrice(calculatedSalePrice);
    } else {
      setSalePrice(Number(price) || 0);
    }
  }, [price, discountPercentage, isOnSale]);

  const handleUpdate = async () => {
    try {
      setSaving(true);

      // Validate required fields
      const hasImages = productVariants.some(
        (variant) => variant.imageUrl || variant.imageFile,
      );
      if (!name || !price || !description || !hasImages) {
        alert("Please fill all fields and add at least one product image");
        return;
      }

      if (
        deliveryType === "charge" &&
        (!deliveryCharge || Number(deliveryCharge) <= 0)
      ) {
        alert("Please enter a valid delivery charge amount");
        return;
      }

      const hasValidSizes = productVariants.every((variant) =>
        variant.sizes.some((s) => s.size && s.stock > 0),
      );

      if (!hasValidSizes) {
        alert("Please add at least one size with stock for each variant");
        return;
      }

      // Upload new images and prepare data
      const updatedColorImages: ProductImage[] = [];
      const allSizes: any[] = [];

      for (let i = 0; i < productVariants.length; i++) {
        const variant = productVariants[i];
        let finalImageUrl = variant.imageUrl;

        if (variant.imageFile) {
          finalImageUrl = await uploadImageToCloudinary(variant.imageFile);
        }

        if (finalImageUrl) {
          const variantColor =
            variant.color === "No Color" ? "" : variant.color;

          updatedColorImages.push({
            color: variantColor,
            url: finalImageUrl,
          });

          // Add sizes for this variant with color association
          const validSizes = variant.sizes
            .filter((s) => s.size && s.stock > 0)
            .map((s) => ({
              color: variantColor,
              size: s.size,
              stock: typeof s.stock === "string" ? parseInt(s.stock) : s.stock,
            }));
          allSizes.push(...validSizes);
        }
      }

      // ⭐ FIX: Build updated colorVariants array with latest sizes
      const updatedColorVariants = updatedColorImages.map((image) => ({
        color: image.color,
        imageUrl: image.url,
        sizes: allSizes.filter((size) => size.color === image.color),
      }));

      // Prepare data for API
      const allImages = updatedColorImages.map((v) => v.url);
      const allColors = updatedColorImages.map((v) => v.color).filter((c) => c);

      await updateProduct(productId, {
        name,
        price: Number(price),
        category,
        description,
        stock: totalStock,
        images: allImages,
        colorImages: updatedColorImages,
        colorVariants: updatedColorVariants, // ⭐ CRITICAL: Save updated colorVariants
        colors: allColors,
        sizes: allSizes,
        isOnSale,
        discountPercentage: Number(discountPercentage || 0),
        salePrice,
        deliveryType,
        deliveryCharge: deliveryType === "charge" ? Number(deliveryCharge) : 0,
        status: "active",
      });

      alert("Product updated successfully");
      router.push("/admin/products?updated=true");
    } catch (error) {
      console.error(error);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const addVariantField = () => {
    setProductVariants([
      ...productVariants,
      {
        color: "",
        imageUrl: "",
        imageFile: null,
        preview: null,
        sizes: [{ size: "", stock: 0 }],
      },
    ]);
  };

  const removeVariantField = (index: number) => {
    const updated = [...productVariants];
    if (updated[index].preview) {
      URL.revokeObjectURL(updated[index].preview!);
    }
    updated.splice(index, 1);
    setProductVariants(updated);
  };

  const handleImageChange = (index: number, file: File | null) => {
    const updated = [...productVariants];
    if (updated[index].preview) {
      URL.revokeObjectURL(updated[index].preview!);
    }
    updated[index].imageFile = file;
    updated[index].imageUrl = "";
    if (file) {
      updated[index].preview = URL.createObjectURL(file);
    } else {
      updated[index].preview = null;
    }
    setProductVariants(updated);
  };

  const addSizeField = (variantIndex: number) => {
    const updated = [...productVariants];
    updated[variantIndex].sizes.push({ size: "", stock: 0 });
    setProductVariants(updated);
  };

  const removeSizeField = (variantIndex: number, sizeIndex: number) => {
    const updated = [...productVariants];
    updated[variantIndex].sizes.splice(sizeIndex, 1);
    setProductVariants(updated);
  };

  const updateSizeField = (
    variantIndex: number,
    sizeIndex: number,
    field: string,
    value: string,
  ) => {
    const updated = [...productVariants];
    if (field === "size") {
      updated[variantIndex].sizes[sizeIndex].size = value;
    } else if (field === "stock") {
      const numericValue = value === "" ? 0 : parseInt(value);
      updated[variantIndex].sizes[sizeIndex].stock = isNaN(numericValue)
        ? 0
        : numericValue;
    }
    setProductVariants(updated);
  };

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImagePreview = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
  };

  const getVariantTotalStock = (sizes: { size: string; stock: number }[]) => {
    return sizes.reduce((sum, item) => {
      const stockValue =
        typeof item.stock === "string"
          ? parseInt(item.stock) || 0
          : item.stock || 0;
      return sum + stockValue;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-black/60 text-xs font-medium tracking-wide mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-black/40"></span>
            Product Management
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Edit Product
              </h1>
              <p className="text-gray-500 mt-3 text-lg max-w-2xl">
                Update product details, images, and inventory
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8 gap-y-10">
              {/* LEFT COLUMN */}
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Premium Oversized Hoodie"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 outline-none transition-all duration-200 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 placeholder:text-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (LKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      Rs
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-5 py-3.5 outline-none transition-all duration-200 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 outline-none cursor-pointer transition-all duration-200 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10"
                  >
                    <option value="mens">Men's Wear</option>
                    <option value="fightwear">Fight Wear</option>
                    <option value="sportswear">Sports Wear</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Delivery Options
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryType"
                        value="free"
                        checked={deliveryType === "free"}
                        onChange={(e) =>
                          setDeliveryType(e.target.value as "free" | "charge")
                        }
                        className="w-4 h-4 text-black focus:ring-black"
                      />
                      <span className="text-gray-700">Free Delivery</span>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Free
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryType"
                        value="charge"
                        checked={deliveryType === "charge"}
                        onChange={(e) =>
                          setDeliveryType(e.target.value as "free" | "charge")
                        }
                        className="w-4 h-4 text-black focus:ring-black"
                      />
                      <span className="text-gray-700">Delivery Charge</span>
                    </label>

                    {deliveryType === "charge" && (
                      <div className="ml-7 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                            Rs
                          </span>
                          <input
                            type="number"
                            placeholder="Delivery Charge Amount"
                            value={deliveryCharge}
                            onChange={(e) => setDeliveryCharge(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-5 py-3 outline-none transition-all duration-200 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Customer will pay this amount for delivery
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Describe your product in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 outline-none resize-none transition-all duration-200 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 placeholder:text-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Stock Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={totalStock}
                      readOnly
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-700 font-semibold cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      Auto-calculated from all variants
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total stock automatically calculated from all variants and
                    their sizes
                  </p>
                </div>

                <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800">
                        On Sale Product
                      </span>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Enable discount for this product
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOnSale}
                        onChange={(e) => setIsOnSale(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-black peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  {isOnSale && (
                    <div className="mt-5 space-y-4 transition-all duration-300 ease-out">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 20"
                          value={discountPercentage}
                          onChange={(e) =>
                            setDiscountPercentage(e.target.value)
                          }
                          className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                        />
                      </div>
                      <div className="bg-white rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Original Price:</span>
                          <span className="font-medium line-through text-gray-400">
                            Rs {price || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold text-gray-700">
                            Sale Price:
                          </span>
                          <span className="font-bold text-green-600">
                            Rs {salePrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Variants Section */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <label className="text-lg font-semibold text-gray-800">
                    Product Variants
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Each variant has its own color, image, and size-wise stock
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariantField}
                  className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <HiPlus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>

              {productVariants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <HiOutlinePhoto className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No variants added yet</p>
                  <button
                    onClick={addVariantField}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add your first variant
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {productVariants.map((variant, variantIndex) => (
                    <div
                      key={variantIndex}
                      className="group relative bg-gray-50 rounded-2xl border border-gray-200 p-5 transition-all hover:shadow-md"
                    >
                      <button
                        onClick={() => removeVariantField(variantIndex)}
                        className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-md"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-4">
                        {/* Color Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color (Optional)
                          </label>
                          <select
                            value={variant.color}
                            onChange={(e) => {
                              const updated = [...productVariants];
                              updated[variantIndex].color = e.target.value;
                              setProductVariants(updated);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                          >
                            {availableColors.map((color) => (
                              <option key={color} value={color}>
                                {color}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-400 mt-1">
                            Select "No Color" if this variant doesn't have a
                            specific color
                          </p>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Image
                          </label>
                          <div className="relative w-full h-48 bg-white border-2 border-dashed border-gray-300 rounded-xl overflow-hidden group/image">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`image-upload-${variantIndex}`}
                              onChange={(e) =>
                                handleImageChange(
                                  variantIndex,
                                  e.target.files?.[0] || null,
                                )
                              }
                            />
                            {variant.preview || variant.imageUrl ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={variant.preview || variant.imageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() =>
                                    openImagePreview(
                                      variant.preview || variant.imageUrl,
                                    )
                                  }
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      openImagePreview(
                                        variant.preview || variant.imageUrl,
                                      )
                                    }
                                    className="bg-white/90 hover:bg-white text-black p-2 rounded-full transition-all transform hover:scale-110"
                                  >
                                    <HiArrowsPointingOut className="w-5 h-5" />
                                  </button>
                                  <label
                                    htmlFor={`image-upload-${variantIndex}`}
                                    className="bg-white/90 hover:bg-white text-black p-2 rounded-full transition-all transform hover:scale-110 cursor-pointer"
                                  >
                                    <HiOutlinePhoto className="w-5 h-5" />
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <label
                                htmlFor={`image-upload-${variantIndex}`}
                                className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <HiOutlinePhoto className="w-12 h-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">
                                  Click to upload image
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                  PNG, JPG, WEBP up to 5MB
                                </span>
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Sizes & Stock */}
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-medium text-gray-700">
                              Sizes & Stock
                            </label>
                            <button
                              type="button"
                              onClick={() => addSizeField(variantIndex)}
                              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            >
                              <HiPlus className="w-3 h-3" />
                              Add Size
                            </button>
                          </div>

                          <div className="space-y-3">
                            {variant.sizes.map((sizeItem, sizeIndex) => (
                              <div
                                key={`${variantIndex}-${sizeIndex}`}
                                className="flex gap-3 items-start"
                              >
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
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                  >
                                    <option value="">Select Size</option>
                                    {sizeOptions.map((group) => (
                                      <optgroup
                                        key={group.type}
                                        label={group.type}
                                      >
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
                                    placeholder="Stock Quantity"
                                    value={
                                      sizeItem.stock === 0 ? "" : sizeItem.stock
                                    }
                                    onChange={(e) =>
                                      updateSizeField(
                                        variantIndex,
                                        sizeIndex,
                                        "stock",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                  />
                                </div>
                                {variant.sizes.length > 1 && (
                                  <button
                                    onClick={() =>
                                      removeSizeField(variantIndex, sizeIndex)
                                    }
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <HiTrash className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {getVariantTotalStock(variant.sizes) > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-xs text-blue-700">
                                Total stock for this variant:{" "}
                                <strong>
                                  {getVariantTotalStock(variant.sizes)} units
                                </strong>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalStock > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">
                    Overall Stock Summary:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {totalStock} units
                  </span>
                </div>
                <div className="mt-2 text-xs text-green-700">
                  Across{" "}
                  {
                    productVariants.filter((v) => v.imageUrl || v.imageFile)
                      .length
                  }{" "}
                  variant(s)
                </div>
              </div>
            )}

            <div className="mt-10 pt-6">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-linear-to-r from-gray-900 to-black text-white py-4 rounded-2xl font-semibold text-lg hover:from-black hover:to-gray-900 transition-all duration-300 transform hover:scale-[1.01] shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving Changes...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-5xl max-h-[90vh] mx-4">
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
