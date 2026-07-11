export const COLLECTIONS = {
  USERS: "users",
  ACCOUNTS: "accounts",
  SESSIONS: "sessions",
  VERIFICATIONS: "verifications",

  SELLER_APPLICATIONS: "sellerApplications",
  SELLER_PROFILES: "sellerProfiles",

  CATEGORIES: "categories",
  PRODUCTS: "products",

  CARTS: "carts",
  WISHLISTS: "wishlists",

  ORDERS: "orders",
  PAYMENTS: "payments",

  REVIEWS: "reviews",
  NOTIFICATIONS: "notifications",
  RECENTLY_VIEWED: "recentlyViewed",
  NEWSLETTER_SUBSCRIBERS: "newsletterSubscribers",
} as const;

export type CollectionName =
  (typeof COLLECTIONS)[keyof typeof COLLECTIONS];