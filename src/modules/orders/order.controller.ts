import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../../shared/types/express.types.js";
import {
  createOrderSchema,
  customerOrderQuerySchema,
  orderIdParamsSchema,
} from "./order.schema.js";
import {
  createCustomerOrder,
  getCustomerOrderById,
  getCustomerOrders,
} from "./order.service.js";

export async function createOrderHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const input =
      createOrderSchema.parse(
        request.body,
      );

    const order =
      await createCustomerOrder(
        authenticatedRequest.auth.user.id,
        input,
      );

    response.status(201).json({
      success: true,
      message:
        "Order created successfully.",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerOrdersHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const query =
      customerOrderQuerySchema.parse(
        request.query,
      );

    const result =
      await getCustomerOrders({
        customerUserId:
          authenticatedRequest.auth.user.id,

        page: query.page,
        limit: query.limit,
      });

    response.status(200).json({
      success: true,
      message:
        "Orders retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerOrderByIdHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const params =
      orderIdParamsSchema.parse(
        request.params,
      );

    const order =
      await getCustomerOrderById(
        params.orderId,
        authenticatedRequest.auth.user.id,
      );

    response.status(200).json({
      success: true,
      message:
        "Order retrieved successfully.",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}