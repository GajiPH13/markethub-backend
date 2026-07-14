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
  productIdParamsSchema,
  productSlugParamsSchema,
  publicProductQuerySchema,
  sellerProductQuerySchema,
  updateProductSchema,
} from "./product.schema.js";
import {
  createProduct,
  deleteSellerProduct,
  getPublicProductBySlug,
  getPublicProducts,
  getSellerProductById,
  getSellerProducts,
  updateSellerProduct,
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
export async function getPublicProductsHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query =
      publicProductQuerySchema.parse(
        request.query,
      );

    const result =
      await getPublicProducts({
        sort: query.sort,
        page: query.page,
        limit: query.limit,

        ...(query.search
          ? {
              search: query.search,
            }
          : {}),

        ...(query.category
          ? {
              category: query.category,
            }
          : {}),

        ...(query.minPrice !== undefined
          ? {
              minPrice: query.minPrice,
            }
          : {}),

        ...(query.maxPrice !== undefined
          ? {
              maxPrice: query.maxPrice,
            }
          : {}),
      });

    response.status(200).json({
      success: true,
      message:
        "Products retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProductBySlugHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const params =
      productSlugParamsSchema.parse(
        request.params,
      );

    const product =
      await getPublicProductBySlug(
        params.slug,
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