import {
  ObjectId,
  type WithId,
} from "mongodb";

import {
  getSellerProfilesCollection,
} from "../../database/get-collections.js";
import { ApiError } from "../../shared/errors/api-error.js";
import type {
  SellerProfileDocument,
} from "./seller.types.js";

export async function getSellerProfileByUserId(
  userId: string,
): Promise<WithId<SellerProfileDocument>> {
  const sellerProfile =
    await getSellerProfilesCollection().findOne({
      userId,
      isApproved: true,
      status: "approved",
    });

  if (!sellerProfile) {
    throw new ApiError(
      404,
      "Approved seller profile was not found.",
      "SELLER_PROFILE_NOT_FOUND",
    );
  }

  return sellerProfile;
}

export async function getSellerProfileById(
  sellerProfileId: string,
): Promise<WithId<SellerProfileDocument>> {
  if (!ObjectId.isValid(sellerProfileId)) {
    throw new ApiError(
      400,
      "Invalid seller profile ID.",
      "INVALID_SELLER_PROFILE_ID",
    );
  }

  const sellerProfile =
    await getSellerProfilesCollection().findOne({
      _id: new ObjectId(sellerProfileId),
      isApproved: true,
      status: "approved",
    });

  if (!sellerProfile) {
    throw new ApiError(
      404,
      "Seller profile was not found.",
      "SELLER_PROFILE_NOT_FOUND",
    );
  }

  return sellerProfile;
}