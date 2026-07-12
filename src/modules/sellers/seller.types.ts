import type {
  BaseDocument,
} from "../../shared/types/common.types.js";

export type SellerProfileStatus =
  | "approved"
  | "suspended";

export interface SellerProfileDocument extends BaseDocument {
  userId: string;

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
  status: SellerProfileStatus;

  approvedBy?: string | null;
  approvedAt?: Date | null;
}