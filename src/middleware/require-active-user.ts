import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { ApiError } from "../shared/errors/api-error.js";
import type { AuthenticatedRequest } from "../shared/types/express.types.js";

export function requireActiveUser(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authenticatedRequest =
    request as AuthenticatedRequest;

  const { user } = authenticatedRequest.auth;

  if (user.isBlocked || user.status === "blocked") {
    next(
      new ApiError(
        403,
        "Your account is currently blocked.",
        "ACCOUNT_BLOCKED",
      ),
    );

    return;
  }

  if (user.status === "suspended") {
    next(
      new ApiError(
        403,
        "Your account is currently suspended.",
        "ACCOUNT_SUSPENDED",
      ),
    );

    return;
  }

  if (user.status !== "active") {
    next(
      new ApiError(
        403,
        "Your account is not active.",
        "ACCOUNT_INACTIVE",
      ),
    );

    return;
  }

  next();
}