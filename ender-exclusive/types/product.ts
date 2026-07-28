// /types/product.ts

export interface ProductSize {
  size: string;
  stock: number;
  color?: string;
}

export interface ProductImage {
  color: string;
  url: string;
}

export interface ColorVariant {
  color: string;
  imageUrl: string;
  images?: string[];
  sizes: ProductSize[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  images: string[];
  colorImages: ProductImage[];
  colorVariants: ColorVariant[];
  colors: string[];
  sizes: ProductSize[];
  isOnSale: boolean;
  discountPercentage: number;
  salePrice: number;
  status: string;
  deliveryType: "free" | "charge";
  deliveryCharge: number;
  slug?: string;
  fashionTags?: string[];
  gender?: "men" | "women" | "unisex";
  season?: "summer" | "winter" | "spring" | "fall" | "all-season";
  occasion?: string;
  style?: string;
}

