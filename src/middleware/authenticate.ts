import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../modules/auth/auth.js";
import type { AuthenticatedRequest } from "../shared/types/express.types.js";
import { ApiError } from "../shared/errors/api-error.js";

export async function authenticate(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      next(
        new ApiError(
          401,
          "Authentication is required.",
          "AUTHENTICATION_REQUIRED",
        ),
      );

      return;
    }

    const authenticatedRequest =
      request as AuthenticatedRequest;

    authenticatedRequest.auth = {
      session: session.session,
      user: session.user,
    };

    next();
  } catch (error) {
    next(error);
  }
}