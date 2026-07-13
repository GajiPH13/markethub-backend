import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../../shared/types/express.types.js";
import {
  getSellerProfileByUserId,
} from "./seller.service.js";

export async function getCurrentSellerProfile(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const sellerProfile =
      await getSellerProfileByUserId(
        authenticatedRequest.auth.user.id,
      );

    response.status(200).json({
      success: true,
      message:
        "Seller profile retrieved successfully.",
      data: {
        sellerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
}