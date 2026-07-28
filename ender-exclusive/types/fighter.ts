export interface FighterImage {
  id: string;
  imageUrl: string;
  mediaType?: "image" | "video";
  displayOrder: number;
  status: "published" | "draft";
  createdAt?: any;
  updatedAt?: any;
}

export interface FighterImageFilterOptions {
  status?: "all" | "published" | "draft";
  mediaType?: "all" | "image" | "video";
  sortBy?: "displayOrder" | "newest";
}

