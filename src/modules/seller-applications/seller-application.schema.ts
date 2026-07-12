import { z } from "zod";

export const createSellerApplicationSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(3, "Business name must be at least 3 characters.")
    .max(100, "Business name must be at most 100 characters."),

  businessEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid business email."),

  businessPhone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(30, "Phone number must be at most 30 characters."),

  businessAddress: z
    .string()
    .trim()
    .min(10, "Business address must be at least 10 characters.")
    .max(300, "Business address must be at most 300 characters."),

  sellerBio: z
    .string()
    .trim()
    .min(20, "Seller bio must be at least 20 characters.")
    .max(1000, "Seller bio must be at most 1000 characters."),

  categoryFocus: z
    .array(
      z.string().trim().min(1, "Category cannot be empty."),
    )
    .min(1, "Select at least one category."),

  logoUrl: z.string().url().optional().nullable(),
  documentUrl: z.string().url().optional().nullable(),
});

export const rejectSellerApplicationSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(5, "Rejection reason must be at least 5 characters.")
    .max(500, "Rejection reason must be at most 500 characters."),
});

export type CreateSellerApplicationInput = z.infer<
  typeof createSellerApplicationSchema
>;

export type RejectSellerApplicationInput = z.infer<
  typeof rejectSellerApplicationSchema
>;