import type {
  NextFunction,
  Request,
  Response,
} from "express";
import type { ZodType } from "zod";

import { ApiError } from "../shared/errors/api-error.js";

export function validateBody(schema: ZodType) {
  return function validateBodyMiddleware(
    request: Request,
    _response: Response,
    next: NextFunction,
  ): void {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(
        new ApiError(
          400,
          "Request validation failed.",
          "VALIDATION_ERROR",
          result.error.flatten(),
        ),
      );

      return;
    }

    request.body = result.data;
    next();
  };
}