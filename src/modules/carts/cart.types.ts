import type {
  ObjectId,
} from "mongodb";

export interface CartItemDocument {
  productId: string;
  quantity: number;
}

export interface CartDocument {
  _id?: ObjectId;

  userId: string;
  items: CartItemDocument[];

  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedCartItem {
  productId: string;
  quantity: number;

  name: string;
  slug: string;
  imageUrl: string | null;

  price: number;
  stock: number;

  lineTotal: number;
}

export interface PopulatedCart {
  _id: string | null;
  userId: string;
  items: PopulatedCartItem[];

  totalItems: number;
  subtotal: number;

  createdAt: Date | null;
  updatedAt: Date | null;
}