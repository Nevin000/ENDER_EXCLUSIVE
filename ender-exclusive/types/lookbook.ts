import { Product } from "./product";

export interface LookBookCollection {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  gender: "men" | "women" | "unisex" | "all";
  season?: "summer" | "winter" | "spring" | "fall" | "all-season" | string;
  status: "draft" | "published";
  productIds: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface MatchingItem {
  id: string; // Unique ID for this item in the array (e.g. uuid)
  image: string;
  title: string;
  description: string;
  displayOrder: number;
}

export interface LookBookProductStyle {
  id?: string; // Firestore Doc ID (could be the same as productId)
  collectionId: string;
  productId: string;
  matchingItems: MatchingItem[];
  styleNotes?: string; // Editorial style notes by admin
  createdAt?: string;
  updatedAt?: string;
}

export type RecommendationCategory =
  | "bottoms"
  | "shoes"
  | "caps"
  | "watches"
  | "sunglasses"
  | "bags"
  | "accessories"
  | "jackets"
  | "tops";

export interface ScoredRecommendation {
  product: Product;
  matchScore: number;
  matchReasons: string[];
  category: RecommendationCategory;
  categoryLabel: string;
}

export interface StylingCategoryGroup {
  category?: RecommendationCategory;
  categoryKey?: RecommendationCategory;
  categoryLabel?: string;
  title?: string;
  items: ScoredRecommendation[];
}

export interface StylingResult {
  mainProduct?: Product;
  topPick?: Product;
  categories?: StylingCategoryGroup[];
  recommendationsGrouped?: StylingCategoryGroup[];
  topScoredItems?: ScoredRecommendation[];
  aiStylingTip?: string;
}
