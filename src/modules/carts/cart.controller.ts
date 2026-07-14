import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../../shared/types/express.types.ts";
import {
  addCartItemSchema,
  cartProductParamsSchema,
  updateCartItemSchema,
} from "../../modules/carts/cart.schema.js";
import {
  addItemToCart,
  clearUserCart,
  getUserCart,
  removeCartItem,
  updateCartItem,
} from "./cart.service.js";

export async function getCartHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const cart = await getUserCart(
      authenticatedRequest.auth.user.id,
    );

    response.status(200).json({
      success: true,
      message:
        "Cart retrieved successfully.",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addCartItemHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const input =
      addCartItemSchema.parse(
        request.body,
      );

    const cart = await addItemToCart(
      authenticatedRequest.auth.user.id,
      input,
    );

    response.status(200).json({
      success: true,
      message:
        "Product added to cart.",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItemHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const params =
      cartProductParamsSchema.parse(
        request.params,
      );

    const input =
      updateCartItemSchema.parse(
        request.body,
      );

    const cart = await updateCartItem(
      authenticatedRequest.auth.user.id,
      params.productId,
      input,
    );

    response.status(200).json({
      success: true,
      message:
        "Cart item updated successfully.",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItemHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const params =
      cartProductParamsSchema.parse(
        request.params,
      );

    const cart = await removeCartItem(
      authenticatedRequest.auth.user.id,
      params.productId,
    );

    response.status(200).json({
      success: true,
      message:
        "Product removed from cart.",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCartHandler(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedRequest =
      request as AuthenticatedRequest;

    const cart = await clearUserCart(
      authenticatedRequest.auth.user.id,
    );

    response.status(200).json({
      success: true,
      message:
        "Cart cleared successfully.",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
}