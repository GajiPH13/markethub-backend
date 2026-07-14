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
} from "./product.schema.js";
import {
  createProduct,
  getSellerProducts,
} from "./product.service.js";

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