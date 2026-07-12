import type { IndexDescription } from "mongodb";

import { getCategoriesCollection } from "./get-collections.js";
import {
  getNotificationsCollection,
  getProductsCollection,
  getReviewsCollection,
  getSellerApplicationsCollection,
  getSellerProfilesCollection,
  getUsersCollection,
} from "./get-collections.js";

export async function createDatabaseIndexes(): Promise<void> {
  const users = getUsersCollection();
  const categories = getCategoriesCollection();
  const products = getProductsCollection();
  const sellerApplications = getSellerApplicationsCollection();
  const sellerProfiles = getSellerProfilesCollection();
  const reviews = getReviewsCollection();
  const notifications = getNotificationsCollection();

  await users.createIndexes([
    {
      key: { email: 1 },
      name: "users_email_unique",
      unique: true,
    },
    {
      key: { role: 1 },
      name: "users_role",
    },
    {
      key: { status: 1, isBlocked: 1 },
      name: "users_status_blocked",
    },
    {
      key: { createdAt: -1 },
      name: "users_createdAt_desc",
    },
  ]);

  await categories.createIndexes([
    {
      key: { slug: 1 },
      name: "categories_slug_unique",
      unique: true,
    },
    {
      key: { name: 1 },
      name: "categories_name_unique",
      unique: true,
    },
    {
      key: { isActive: 1, displayOrder: 1 },
      name: "categories_active_displayOrder",
    },
  ]);

  const productIndexes: IndexDescription[] = [
    {
      key: { slug: 1 },
      name: "products_slug_unique",
      unique: true,
    },
    {
      key: { status: 1, createdAt: -1 },
      name: "products_status_createdAt",
    },
    {
      key: { status: 1, categoryId: 1, createdAt: -1 },
      name: "products_status_category_createdAt",
    },
    {
      key: { status: 1, sellerId: 1, createdAt: -1 },
      name: "products_status_seller_createdAt",
    },
    {
      key: { status: 1, price: 1 },
      name: "products_status_price",
    },
    {
      key: { status: 1, averageRating: -1 },
      name: "products_status_rating",
    },
    {
      key: { status: 1, salesCount: -1 },
      name: "products_status_sales",
    },
    {
      key: { status: 1, isFeatured: 1, createdAt: -1 },
      name: "products_status_featured_createdAt",
    },
    {
      key: {
        name: "text",
        brand: "text",
        categoryName: "text",
        shortDescription: "text",
      },
      name: "products_text_search",
      weights: {
        name: 10,
        brand: 5,
        categoryName: 3,
        shortDescription: 1,
      },
      default_language: "english",
    },
  ];
  await products.createIndexes(productIndexes);

  await sellerApplications.createIndexes([
    {
      key: { userId: 1 },
      name: "sellerApplications_user_unique",
      unique: true,
    },
    {
      key: { status: 1, createdAt: -1 },
      name: "sellerApplications_status_createdAt",
    },
    {
      key: { businessEmail: 1 },
      name: "sellerApplications_businessEmail",
    },
  ]);

  await sellerProfiles.createIndexes([
    {
      key: { userId: 1 },
      name: "sellerProfiles_user_unique",
      unique: true,
    },
    {
      key: { businessName: 1 },
      name: "sellerProfiles_businessName",
    },
    {
      key: { isApproved: 1, averageRating: -1 },
      name: "sellerProfiles_approved_rating",
    },
  ]);

  await reviews.createIndexes([
    {
      key: { productId: 1, customerId: 1 },
      name: "reviews_product_customer_unique",
      unique: true,
    },
    {
      key: { productId: 1, status: 1, createdAt: -1 },
      name: "reviews_product_status_createdAt",
    },
    {
      key: { customerId: 1, createdAt: -1 },
      name: "reviews_customer_createdAt",
    },
    {
      key: { orderId: 1 },
      name: "reviews_order",
    },
  ]);

  await notifications.createIndexes([
    {
      key: { recipientId: 1, isRead: 1, createdAt: -1 },
      name: "notifications_recipient_read_createdAt",
    },
    {
      key: { recipientId: 1, createdAt: -1 },
      name: "notifications_recipient_createdAt",
    },
  ]);

  await sellerApplications.createIndexes([
    {
      key: {
        userId: 1,
        status: 1,
      },
      name: "seller_application_user_status",
    },
    {
      key: {
        status: 1,
        createdAt: -1,
      },
      name: "sellerApplications_status_createdAt",
    },
  ]);
  console.log("MongoDB indexes created successfully.");
}
