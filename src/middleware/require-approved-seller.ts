import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { ObjectId } from "mongodb";

import { getSellerProfilesCollection } from "../database/get-collections.js";
import { ApiError } from "../shared/errors/api-error.js";
import type { AuthenticatedRequest } from "../shared/types/express.types.js";

export async function requireApprovedSeller(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const { user } = authenticatedRequest.auth;

    if (user.role !== "seller") {
      next(
        new ApiError(
          403,
          "An approved seller account is required.",
          "SELLER_ACCESS_REQUIRED",
        ),
      );

      return;
    }

    if (!ObjectId.isValid(user.id)) {
      next(
        new ApiError(
          400,
          "The authenticated user ID is invalid.",
          "INVALID_USER_ID",
        ),
      );

      return;
    }

    const sellerProfile =
      await getSellerProfilesCollection().findOne({
        userId: new ObjectId(user.id),
        isApproved: true,
      });

    if (!sellerProfile) {
      next(
        new ApiError(
          403,
          "Your seller account is not approved.",
          "SELLER_APPROVAL_REQUIRED",
        ),
      );

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}