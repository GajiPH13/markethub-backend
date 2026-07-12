import type { ObjectId } from "mongodb";

import type { SellerApplicationStatus } from "../../shared/types/common.types.js";

export interface SellerApplicationDocument {
  _id?: ObjectId;

  userId: string;

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
  reviewedBy?: string | null;
  reviewedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export { type SellerApplicationStatus };