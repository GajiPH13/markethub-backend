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
} from "./product.schema.js";
import {
  createProduct,
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