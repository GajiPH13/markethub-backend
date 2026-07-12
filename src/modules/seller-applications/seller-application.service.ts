import {
  ObjectId,
  type WithId,
} from "mongodb";

import {
  getSellerApplicationsCollection,
  getSellerProfilesCollection,
  getUsersCollection,
} from "../../database/get-collections.js";
import { ApiError } from "../../shared/errors/api-error.js";
import type {
  CreateSellerApplicationInput,
  RejectSellerApplicationInput,
} from "./seller-application.schema.js";
import type {
  SellerApplicationDocument,
  SellerApplicationStatus,
} from "./seller-application.types.js";

interface Applicant {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface GetApplicationsOptions {
  status?: SellerApplicationStatus;
  page: number;
  limit: number;
}

export async function createSellerApplication(
  user: Applicant,
  input: CreateSellerApplicationInput,
): Promise<WithId<SellerApplicationDocument>> {
  if (user.role === "seller") {
    throw new ApiError(
      409,
      "You already have a seller account.",
      "ALREADY_A_SELLER",
    );
  }

  const applications =
    getSellerApplicationsCollection();

  const existingPendingApplication =
    await applications.findOne({
      userId: user.id,
      status: "pending",
    });

  if (existingPendingApplication) {
    throw new ApiError(
      409,
      "You already have a pending seller application.",
      "SELLER_APPLICATION_PENDING",
    );
  }

  const now = new Date();

  const application: SellerApplicationDocument = {
    userId: user.id,
    businessName: input.businessName,
    businessEmail: input.businessEmail,
    businessPhone: input.businessPhone,
    businessAddress: input.businessAddress,
    sellerBio: input.sellerBio,
    categoryFocus: input.categoryFocus,
    logoUrl: input.logoUrl ?? null,
    documentUrl: input.documentUrl ?? null,
    status: "pending",
    rejectionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const result =
    await applications.insertOne(application);

  return {
    ...application,
    _id: result.insertedId,
  };
}

export async function getMySellerApplication(
  userId: string,
): Promise<WithId<SellerApplicationDocument> | null> {
  return getSellerApplicationsCollection().findOne(
    {
      userId,
    },
    {
      sort: {
        createdAt: -1,
      },
    },
  );
}

export async function getSellerApplications({
  status,
  page,
  limit,
}: GetApplicationsOptions) {
  const applications =
    getSellerApplicationsCollection();

  const filter = status
    ? {
        status,
      }
    : {};

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    applications
      .find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .toArray(),

    applications.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages:
        total === 0
          ? 0
          : Math.ceil(total / limit),
    },
  };
}

function parseApplicationId(
  applicationId: string,
): ObjectId {
  if (!ObjectId.isValid(applicationId)) {
    throw new ApiError(
      400,
      "Invalid seller application ID.",
      "INVALID_APPLICATION_ID",
    );
  }

  return new ObjectId(applicationId);
}

export async function approveSellerApplication(
  applicationId: string,
  adminId: string,
): Promise<WithId<SellerApplicationDocument>> {
  const id = parseApplicationId(applicationId);

  const applications =
    getSellerApplicationsCollection();

  const sellerProfiles =
    getSellerProfilesCollection();

  const users = getUsersCollection();

  const application = await applications.findOne({
    _id: id,
  });

  if (!application) {
    throw new ApiError(
      404,
      "Seller application was not found.",
      "SELLER_APPLICATION_NOT_FOUND",
    );
  }

  if (application.status !== "pending") {
    throw new ApiError(
      409,
      "Only pending seller applications can be approved.",
      "SELLER_APPLICATION_ALREADY_REVIEWED",
    );
  }

  const applicant = await users.findOne({
    id: application.userId,
  });

  if (!applicant) {
    throw new ApiError(
      404,
      "The applicant account was not found.",
      "APPLICANT_NOT_FOUND",
    );
  }

  const now = new Date();

  const sellerProfile =
    await sellerProfiles.findOneAndUpdate(
      {
        userId: application.userId,
      },
      {
        $set: {
          businessName:
            application.businessName,
          businessEmail:
            application.businessEmail,
          businessPhone:
            application.businessPhone,
          businessAddress:
            application.businessAddress,
          bio: application.sellerBio,
          logoUrl:
            application.logoUrl ?? null,
          categoryFocus:
            application.categoryFocus,

          status: "approved",
          isApproved: true,

          approvedBy: adminId,
          approvedAt: now,
          updatedAt: now,
        },

        $setOnInsert: {
          userId: application.userId,
          averageRating: 0,
          reviewCount: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

  if (!sellerProfile) {
    throw new ApiError(
      500,
      "Unable to create the seller profile.",
      "SELLER_PROFILE_CREATION_FAILED",
    );
  }

  const userUpdateResult =
    await users.updateOne(
      {
        id: application.userId,
      },
      {
        $set: {
          role: "seller",
          status: "active",
          isBlocked: false,
          sellerProfileId:
            sellerProfile._id.toHexString(),
          updatedAt: now,
        },
      },
    );

  if (userUpdateResult.matchedCount === 0) {
    throw new ApiError(
      404,
      "The applicant account was not found.",
      "APPLICANT_NOT_FOUND",
    );
  }

  const updatedApplication =
    await applications.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
      },
      {
        $set: {
          status: "approved",
          reviewedBy: adminId,
          reviewedAt: now,
          rejectionReason: null,
          updatedAt: now,
        },
      },
      {
        returnDocument: "after",
      },
    );

  if (!updatedApplication) {
    throw new ApiError(
      409,
      "The seller application has already been reviewed.",
      "SELLER_APPLICATION_ALREADY_REVIEWED",
    );
  }

  return updatedApplication;
}

export async function rejectSellerApplication(
  applicationId: string,
  adminId: string,
  input: RejectSellerApplicationInput,
): Promise<WithId<SellerApplicationDocument>> {
  const id = parseApplicationId(applicationId);
  const now = new Date();

  const applications =
    getSellerApplicationsCollection();

  const rejectedApplication =
    await applications.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          reviewedBy: adminId,
          reviewedAt: now,
          rejectionReason:
            input.rejectionReason,
          updatedAt: now,
        },
      },
      {
        returnDocument: "after",
      },
    );

  if (!rejectedApplication) {
    const existingApplication =
      await applications.findOne({
        _id: id,
      });

    if (!existingApplication) {
      throw new ApiError(
        404,
        "Seller application was not found.",
        "SELLER_APPLICATION_NOT_FOUND",
      );
    }

    throw new ApiError(
      409,
      "The seller application has already been reviewed.",
      "SELLER_APPLICATION_ALREADY_REVIEWED",
    );
  }

  return rejectedApplication;
}