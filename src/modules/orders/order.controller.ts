import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../../shared/types/express.types.js";
import {
  adminOrderQuerySchema,
  createOrderSchema,
  customerOrderQuerySchema,
  orderIdParamsSchema,
  sellerOrderQuerySchema,
  updateAdminOrderStatusSchema,
  updateSellerOrderStatusSchema,
  cancelCustomerOrderSchema, 

} from "./order.schema.js";
import {
  createCustomerOrder,
  getAdminOrderById,
  getAdminOrders,
  getCustomerOrderById,
  getCustomerOrders,
  getSellerOrderById,
  getSellerOrders,
  updateAdminOrder,
  updateSellerOrderStatus,
  cancelCustomerOrder,
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
export async function getSellerOrdersHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const query =
      sellerOrderQuerySchema.parse(
        request.query,
      );

    const result =
      await getSellerOrders({
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
        "Seller orders retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerOrderByIdHandler(
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
      await getSellerOrderById(
        params.orderId,
        authenticatedRequest.auth.user.id,
      );

    response.status(200).json({
      success: true,
      message:
        "Seller order retrieved successfully.",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSellerOrderStatusHandler(
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

    const input =
      updateSellerOrderStatusSchema.parse(
        request.body,
      );

    const order =
      await updateSellerOrderStatus(
        params.orderId,
        authenticatedRequest.auth.user.id,
        input.status,
      );

    response.status(200).json({
      success: true,
      message:
        "Order status updated successfully.",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function getAdminOrdersHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query =
      adminOrderQuerySchema.parse(
        request.query,
      );

    const result =
      await getAdminOrders({
        page: query.page,
        limit: query.limit,

        ...(query.search
          ? {
              search: query.search,
            }
          : {}),

        ...(query.orderStatus
          ? {
              orderStatus:
                query.orderStatus,
            }
          : {}),

        ...(query.paymentStatus
          ? {
              paymentStatus:
                query.paymentStatus,
            }
          : {}),
      });

    response.status(200).json({
      success: true,
      message:
        "Admin orders retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
export async function getAdminOrderByIdHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const params =
      orderIdParamsSchema.parse(
        request.params,
      );

    const order =
      await getAdminOrderById(
        params.orderId,
      );

    response.status(200).json({
      success: true,
      message:
        "Admin order retrieved successfully.",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function updateAdminOrderHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const params =
      orderIdParamsSchema.parse(
        request.params,
      );

    const input =
      updateAdminOrderStatusSchema.parse(
        request.body,
      );

    const order =
      await updateAdminOrder(
        params.orderId,
        input,
      );

    response.status(200).json({
      success: true,
      message:
        "Order updated successfully.",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelCustomerOrderHandler(
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

    const input =
      cancelCustomerOrderSchema.parse(
        request.body,
      );

    const order =
      await cancelCustomerOrder(
        params.orderId,
        authenticatedRequest.auth.user.id,
        input,
      );

    response.status(200).json({
      success: true,
      message:
        "Order cancelled successfully.",

      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}