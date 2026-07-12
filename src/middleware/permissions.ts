import { authorize } from "./authorize.js";

export const requireCustomer = authorize("customer");

export const requireSeller = authorize("seller");

export const requireAdmin = authorize("admin");

export const requireSellerOrAdmin = authorize(
  "seller",
  "admin",
);

export const requireAuthenticatedRole = authorize(
  "customer",
  "seller",
  "admin",
);