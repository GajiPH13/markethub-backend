import type { ObjectId } from "mongodb";
export type UserRole = "customer" | "seller" | "admin";
export type AccountStatus = "active" | "blocked" | "suspended";
export type ProductStatus = "pending" | "approved" | "rejected";
export type SellerApplicationStatus = "pending" | "approved" | "rejected";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type NotificationType =
  | "order-placed"
  | "payment-successful"
  | "order-shipped"
  | "order-delivered"
  | "new-order"
  | "product-approved"
  | "product-rejected"
  | "low-stock"
  | "seller-application"
  | "product-pending"
  | "review-reported";
export interface BaseDocument {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
