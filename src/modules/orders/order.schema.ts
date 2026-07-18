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

export const SELLER_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const sellerOrderQuerySchema =
  z.object({
    status: z
      .enum(SELLER_ORDER_STATUSES)
      .optional(),

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

export const updateSellerOrderStatusSchema =
  z.object({
    status: z.enum(
      SELLER_ORDER_STATUSES,
    ),
  });

export type SellerOrderStatus =
  (typeof SELLER_ORDER_STATUSES)[number];

export type UpdateSellerOrderStatusInput =
  z.infer<
    typeof updateSellerOrderStatusSchema
  >;
  export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export const adminOrderQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(
      100,
      "Search cannot exceed 100 characters.",
    )
    .optional(),

  orderStatus: z
    .enum(ORDER_STATUSES)
    .optional(),

  paymentStatus: z
    .enum(PAYMENT_STATUSES)
    .optional(),

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
    .default(20),
});

export const updateAdminOrderStatusSchema =
  z.object({
    orderStatus: z
      .enum(ORDER_STATUSES)
      .optional(),

    paymentStatus: z
      .enum(PAYMENT_STATUSES)
      .optional(),
  })
  .refine(
    (value) =>
      value.orderStatus !== undefined ||
      value.paymentStatus !== undefined,
    {
      message:
        "At least one status must be provided.",
    },
  );

export type AdminOrderQueryInput =
  z.infer<
    typeof adminOrderQuerySchema
  >;

export type UpdateAdminOrderStatusInput =
  z.infer<
    typeof updateAdminOrderStatusSchema
  >;
  export const cancelCustomerOrderSchema =
  z.object({
    reason: z
      .string()
      .trim()
      .min(
        3,
        "Cancellation reason must contain at least 3 characters.",
      )
      .max(
        300,
        "Cancellation reason cannot exceed 300 characters.",
      )
      .optional(),
  });

export type CancelCustomerOrderInput =
  z.infer<
    typeof cancelCustomerOrderSchema
  >;