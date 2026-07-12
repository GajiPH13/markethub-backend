import type {
  ErrorRequestHandler,
} from "express";

import { ApiError } from "../shared/errors/api-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      ...(error.details !== undefined
        ? { details: error.details }
        : {}),
    });

    return;
  }

  console.error("Unhandled application error:", error);

  response.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
    code: "INTERNAL_SERVER_ERROR",
  });
};