import type { ObjectId } from "mongodb";
import type { BaseDocument } from "../../shared/types/common.types.js";
export interface RecentlyViewedDocument extends BaseDocument {
  customerId: ObjectId;
  productId: ObjectId;
  viewedAt: Date;
}
