import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(
      1,
      "Product ID is required.",
    ),

  quantity: z.coerce
    .number()
    .int(
      "Quantity must be a whole number.",
    )
    .min(
      1,
      "Quantity must be at least 1.",
    )
    .max(
      100,
      "Quantity cannot exceed 100.",
    )
    .default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number()
    .int(
      "Quantity must be a whole number.",
    )
    .min(
      1,
      "Quantity must be at least 1.",
    )
    .max(
      100,
      "Quantity cannot exceed 100.",
    ),
});

export const cartProductParamsSchema =
  z.object({
    productId: z
      .string()
      .trim()
      .min(
        1,
        "Product ID is required.",
      ),
  });

export type AddCartItemInput =
  z.infer<typeof addCartItemSchema>;

export type UpdateCartItemInput =
  z.infer<typeof updateCartItemSchema>;