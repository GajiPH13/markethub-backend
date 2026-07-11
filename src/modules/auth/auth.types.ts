import type { MarketplaceUser } from "../users/user.types.js";
import type { auth } from "./auth.js";
export interface AuthenticatedSession {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };

  user: MarketplaceUser;
}


export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];