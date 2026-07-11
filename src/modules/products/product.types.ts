import type { ObjectId } from "mongodb";
import type {
  BaseDocument,
  ProductStatus,
} from "../../shared/types/common.types.js";
export interface ProductSpecification {
  name: string;
  value: string;
}
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}
export interface ProductDocument extends BaseDocument {
  sellerId: ObjectId;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  images: ProductImage[];
  categoryId: ObjectId;
  categoryName: string;
  brand: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  specifications: ProductSpecification[];
  averageRating: number;
  reviewCount: number;
  status: ProductStatus;
  rejectionReason?: string | null;
  isFeatured: boolean;
  salesCount: number;
  viewCount: number;
  approvedAt?: Date | null;
  approvedBy?: ObjectId | null;
}
