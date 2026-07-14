import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z
      .string()
      .trim()
      .min(
        2,
        "Full name must contain at least 2 characters.",
      )
      .max(
        100,
        "Full name cannot exceed 100 characters.",
      ),

    phone: z
      .string()
      .trim()
      .min(
        6,
        "Phone number is too short.",
      )
      .max(
        30,
        "Phone number cannot exceed 30 characters.",
      ),

    addressLine1: z
      .string()
      .trim()
      .min(
        3,
        "Address is required.",
      )
      .max(
        150,
        "Address cannot exceed 150 characters.",
      ),

    addressLine2: z
      .string()
      .trim()
      .max(
        150,
        "Address line 2 cannot exceed 150 characters.",
      )
      .optional()
      .nullable(),

    city: z
      .string()
      .trim()
      .min(
        2,
        "City is required.",
      )
      .max(
        80,
        "City cannot exceed 80 characters.",
      ),

    state: z
      .string()
      .trim()
      .max(
        80,
        "State cannot exceed 80 characters.",
      )
      .optional()
      .nullable(),

    postalCode: z
      .string()
      .trim()
      .min(
        2,
        "Postal code is required.",
      )
      .max(
        20,
        "Postal code cannot exceed 20 characters.",
      ),

    country: z
      .string()
      .trim()
      .min(
        2,
        "Country is required.",
      )
      .max(
        80,
        "Country cannot exceed 80 characters.",
      ),
  }),

  customerNote: z
    .string()
    .trim()
    .max(
      500,
      "Customer note cannot exceed 500 characters.",
    )
    .optional()
    .nullable(),
});

export const orderIdParamsSchema =
  z.object({
    orderId: z
      .string()
      .trim()
      .min(
        1,
        "Order ID is required.",
      ),
  });

export const customerOrderQuerySchema =
  z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),
  });

export type CreateOrderInput =
  z.infer<typeof createOrderSchema>;