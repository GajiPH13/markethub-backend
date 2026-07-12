import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type { AuthUser } from "../modules/auth/auth.types.js";
import { ApiError } from "../shared/errors/api-error.js";
import type { AuthenticatedRequest } from "../shared/types/express.types.js";

export type UserRole =
  AuthUser["role"] extends string
    ? AuthUser["role"]
    : "customer" | "seller" | "admin";

export function authorize(
  ...allowedRoles: UserRole[]
) {
  return function roleAuthorizationMiddleware(
    request: Request,
    _response: Response,
    next: NextFunction,
  ): void {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const role =
      authenticatedRequest.auth.user.role as UserRole;

    if (!allowedRoles.includes(role)) {
      next(
        new ApiError(
          403,
          "You do not have permission to access this resource.",
          "INSUFFICIENT_PERMISSIONS",
        ),
      );

      return;
    }

    next();
  };
}