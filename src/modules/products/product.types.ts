import type {
  ObjectId,
} from "mongodb";

export type ProductStatus =
  | "draft"
  | "active"
  | "inactive";

export interface ProductDocument {
  _id?: ObjectId;

  sellerId: string;
  sellerUserId: string;

  name: string;
  slug: string;
  description: string;

  category: string;
  brand: string | null;

  price: number;
  compareAtPrice: number | null;

  stock: number;
  sku: string | null;

  imageUrls: string[];

  status: ProductStatus;
  isFeatured: boolean;

  averageRating: number;
  reviewCount: number;
  totalSales: number;

  createdAt: Date;
  updatedAt: Date;
}