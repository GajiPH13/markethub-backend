import type { Request } from "express";

import type {
  AuthSession,
  AuthUser,
} from "../../modules/auth/auth.types.js";

export interface AuthenticatedRequest extends Request {
  auth: {
    session: AuthSession["session"];
    user: AuthUser;
  };
}