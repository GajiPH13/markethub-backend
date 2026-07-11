export const USER_ROLES = ["customer", "seller", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = [
  "active",
  "suspended",
  "blocked",
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export interface MarketplaceUser {
  id: string;

  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;

  role: UserRole;
  status: UserStatus;
  isBlocked: boolean;

  phone?: string | null;
  address?: string | null;
  sellerProfileId?: string | null;

  createdAt: Date;
  updatedAt: Date;
}