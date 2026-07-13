import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters.")
    .max(120, "Product name cannot exceed 120 characters."),

  description: z
    .string()
    .trim()
    .min(
      20,
      "Product description must be at least 20 characters.",
    )
    .max(
      5000,
      "Product description cannot exceed 5000 characters.",
    ),

  category: z
    .string()
    .trim()
    .min(2, "Product category is required.")
    .max(80, "Category cannot exceed 80 characters."),

  brand: z
    .string()
    .trim()
    .max(100, "Brand cannot exceed 100 characters.")
    .nullable()
    .optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than zero.")
    .max(
      1_000_000,
      "Price cannot exceed 1,000,000.",
    ),

  compareAtPrice: z.coerce
    .number()
    .positive(
      "Compare-at price must be greater than zero.",
    )
    .max(
      1_000_000,
      "Compare-at price cannot exceed 1,000,000.",
    )
    .nullable()
    .optional(),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(
      1_000_000,
      "Stock cannot exceed 1,000,000.",
    ),

  sku: z
    .string()
    .trim()
    .max(100, "SKU cannot exceed 100 characters.")
    .nullable()
    .optional(),

  imageUrls: z
    .array(z.string().url("Each image must be a valid URL."))
    .max(10, "A product can have at most 10 images.")
    .default([]),

  status: z
    .enum([
      "draft",
      "active",
      "inactive",
    ])
    .default("draft"),
})
.superRefine((value, context) => {
  if (
    value.compareAtPrice !== null &&
    value.compareAtPrice !== undefined &&
    value.compareAtPrice <= value.price
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["compareAtPrice"],
      message:
        "Compare-at price must be greater than the regular price.",
    });
  }
});

export type CreateProductInput =
  z.infer<typeof createProductSchema>;