import type { ObjectId } from "mongodb";
import type {
  BaseDocument,
  SellerApplicationStatus,
} from "../../shared/types/common.types.js";
export interface SellerApplicationDocument extends BaseDocument {
  userId: ObjectId;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  sellerBio: string;
  categoryFocus: string[];
  logoUrl?: string | null;
  documentUrl?: string | null;
  status: SellerApplicationStatus;
  rejectionReason?: string | null;
  reviewedBy?: ObjectId | null;
  reviewedAt?: Date | null;
}

export interface SellerProfileDocument extends BaseDocument {
  userId: ObjectId;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  bio: string;
  logoUrl?: string | null;
  categoryFocus: string[];
  averageRating: number;
  reviewCount: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  isApproved: boolean;
}
