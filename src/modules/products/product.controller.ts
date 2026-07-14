import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../../shared/types/express.types.js";
import {
  createProductSchema,
  sellerProductQuerySchema,
  updateProductSchema,
  productIdParamsSchema,
} from "./product.schema.js";
import {
  createProduct,
  getSellerProducts,
  getSellerProductById,
  updateSellerProduct,
  deleteSellerProduct,
} from "./product.service.js";

import { ApiError } from "../../shared/errors/api-error.js";

export async function createProductHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const input =
      createProductSchema.parse(request.body);

    const product = await createProduct(
      authenticatedRequest.auth.user.id,
      input,
    );

    response.status(201).json({
      success: true,
      message:
        "Product created successfully.",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerProductsHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const query =
      sellerProductQuerySchema.parse(
        request.query,
      );

    
      const result =
  await getSellerProducts({
    sellerUserId:
      authenticatedRequest.auth.user.id,
    page: query.page,
    limit: query.limit,
    ...(query.status
      ? {
          status: query.status,
        }
      : {}),
  });

    response.status(200).json({
      success: true,
      message:
        "Seller products retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerProductByIdHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const params =
      productIdParamsSchema.parse(
        request.params,
      );

    const product =
      await getSellerProductById(
        params.productId,
        authenticatedRequest.auth.user.id,
      );

    response.status(200).json({
      success: true,
      message:
        "Product retrieved successfully.",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSellerProductHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const params =
      productIdParamsSchema.parse(
        request.params,
      );

    const input =
      updateProductSchema.parse(
        request.body,
      );

    if (Object.keys(input).length === 0) {
      throw new ApiError(
        400,
        "At least one product field must be provided.",
        "EMPTY_PRODUCT_UPDATE",
      );
    }

    const product =
      await updateSellerProduct(
        params.productId,
        authenticatedRequest.auth.user.id,
        input,
      );

    response.status(200).json({
      success: true,
      message:
        "Product updated successfully.",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSellerProductHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const params =
      productIdParamsSchema.parse(
        request.params,
      );

    await deleteSellerProduct(
      params.productId,
      authenticatedRequest.auth.user.id,
    );

    response.status(200).json({
      success: true,
      message:
        "Product deleted successfully.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
}