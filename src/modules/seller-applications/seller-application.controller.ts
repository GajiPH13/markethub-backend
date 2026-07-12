import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { ApiError } from "../../shared/errors/api-error.js";
import type { AuthenticatedRequest } from "../../shared/types/express.types.js";
import type {
  CreateSellerApplicationInput,
  RejectSellerApplicationInput,
} from "./seller-application.schema.js";
import {
  approveSellerApplication,
  createSellerApplication,
  getMySellerApplication,
  getSellerApplications,
  rejectSellerApplication,
} from "./seller-application.service.js";
import type { SellerApplicationStatus } from "./seller-application.types.js";

export async function submitSellerApplication(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const application = await createSellerApplication(
      authenticatedRequest.auth.user,
      request.body as CreateSellerApplicationInput,
    );

    response.status(201).json({
      success: true,
      message:
        "Seller application submitted successfully.",
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOwnSellerApplication(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const application = await getMySellerApplication(
      authenticatedRequest.auth.user.id,
    );

    response.status(200).json({
      success: true,
      message:
        "Seller application retrieved successfully.",
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listSellerApplications(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const statusValue =
      typeof request.query.status === "string"
        ? request.query.status
        : undefined;

    const validStatuses: SellerApplicationStatus[] = [
      "pending",
      "approved",
      "rejected",
    ];

    const status =
      statusValue &&
      validStatuses.includes(
        statusValue as SellerApplicationStatus,
      )
        ? (statusValue as SellerApplicationStatus)
        : undefined;

    const page = Math.max(
      Number(request.query.page) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(Number(request.query.limit) || 20, 1),
      100,
    );

    const result = await getSellerApplications({
      page,
      limit,
      ...(status ? { status } : {}),
    });

    response.status(200).json({
      success: true,
      message:
        "Seller applications retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function approveApplication(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const applicationId = request.params.id;

    if (
      typeof applicationId !== "string" ||
      applicationId.length === 0
    ) {
      throw new ApiError(
        400,
        "Seller application ID is required.",
        "APPLICATION_ID_REQUIRED",
      );
    }

    const application = await approveSellerApplication(
      applicationId,
      authenticatedRequest.auth.user.id,
    );

    response.status(200).json({
      success: true,
      message:
        "Seller application approved successfully.",
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectApplication(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const applicationId = request.params.id;

    if (
      typeof applicationId !== "string" ||
      applicationId.length === 0
    ) {
      throw new ApiError(
        400,
        "Seller application ID is required.",
        "APPLICATION_ID_REQUIRED",
      );
    }

    const application = await rejectSellerApplication(
      applicationId,
      authenticatedRequest.auth.user.id,
      request.body as RejectSellerApplicationInput,
    );

    response.status(200).json({
      success: true,
      message:
        "Seller application rejected successfully.",
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
}