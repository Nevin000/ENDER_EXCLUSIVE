// types/cart.ts

export interface CartItem {
  id: string;
  userId: string; 
  productId: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  isOnSale?: boolean;
  color: string;
  size: string;
  quantity: number;
  stock: number;
  deliveryCharge: number;
  createdAt?: any; 
}

// For adding to cart (without id)
export interface AddToCartInput {
  userId: string; 
  productId: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  isOnSale?: boolean;
  color: string;
  size: string;
  quantity: number;
  stock: number;
  deliveryCharge: number;
}