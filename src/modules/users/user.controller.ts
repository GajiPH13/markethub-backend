import type {
  Request,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../shared/types/express.types.js";

export function getCurrentUser(
  request: Request,
  response: Response,
): void {
  const authenticatedRequest =
    request as AuthenticatedRequest;

  response.status(200).json({
    success: true,
    message: "Current user retrieved successfully.",
    data: {
      user: authenticatedRequest.auth.user,
      session: authenticatedRequest.auth.session,
    },
  });
}