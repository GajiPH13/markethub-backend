import type { ObjectId } from "mongodb";

import type {
  BaseDocument,
  ReviewStatus,
} from "../../shared/types/common.types.js";

export interface ReviewDocument extends BaseDocument {
  productId: ObjectId;
  customerId: ObjectId;
  orderId: ObjectId;

  rating: number;
  comment: string;

  status: ReviewStatus;

  isEdited: boolean;

  moderatedBy?: ObjectId | null;
  moderatedAt?: Date | null;
  moderationReason?: string | null;
}