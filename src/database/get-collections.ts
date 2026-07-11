import type { Collection } from "mongodb";
import type { CategoryDocument } from "../modules/categories/category.types.js";
import type { NotificationDocument } from "../modules/notifications/notification.types.js";
import type { ProductDocument } from "../modules/products/product.types.js";
import type { ReviewDocument } from "../modules/reviews/review.types.js";
import type {
  SellerApplicationDocument,
  SellerProfileDocument,
} from "../modules/sellers/seller.types.js";
import type { MarketplaceUser } from "../modules/users/user.types.js";
import { COLLECTIONS } from "./collections.js";
import { getDatabase } from "./mongodb.js";
export function getUsersCollection(): Collection<MarketplaceUser> {
  return getDatabase().collection<MarketplaceUser>(COLLECTIONS.USERS);
}
export function getCategoriesCollection(): Collection<CategoryDocument> {
  return getDatabase().collection<CategoryDocument>(COLLECTIONS.CATEGORIES);
}
export function getProductsCollection(): Collection<ProductDocument> {
  return getDatabase().collection<ProductDocument>(COLLECTIONS.PRODUCTS);
}
export function getSellerApplicationsCollection(): Collection<SellerApplicationDocument> {
  return getDatabase().collection<SellerApplicationDocument>(
    COLLECTIONS.SELLER_APPLICATIONS,
  );
}
export function getSellerProfilesCollection(): Collection<SellerProfileDocument> {
  return getDatabase().collection<SellerProfileDocument>(
    COLLECTIONS.SELLER_PROFILES,
  );
}
export function getReviewsCollection(): Collection<ReviewDocument> {
  return getDatabase().collection<ReviewDocument>(COLLECTIONS.REVIEWS);
}
export function getNotificationsCollection(): Collection<NotificationDocument> {
  return getDatabase().collection<NotificationDocument>(
    COLLECTIONS.NOTIFICATIONS,
  );
}
