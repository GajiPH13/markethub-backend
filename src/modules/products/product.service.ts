import type {
  WithId,
} from "mongodb";

import {
  getProductsCollection,
  getSellerProfilesCollection,
} from "../../database/get-collections.js";
import { ApiError } from "../../shared/errors/api-error.js";
import {
  createSlug,
} from "../../shared/utils/creat-slug.js";
import type {
  CreateProductInput,
} from "./product.schema.js";
import type {
  ProductDocument,
} from "./product.types.js";

async function createUniqueProductSlug(
  productName: string,
): Promise<string> {
  const products = getProductsCollection();

  const baseSlug =
    createSlug(productName) || "product";

  let slug = baseSlug;
  let suffix = 1;

  while (
    await products.findOne(
      {
        slug,
      },
      {
        projection: {
          _id: 1,
        },
      },
    )
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

export async function createProduct(
  sellerUserId: string,
  input: CreateProductInput,
): Promise<WithId<ProductDocument>> {
  const sellerProfiles =
    getSellerProfilesCollection();

  const sellerProfile =
    await sellerProfiles.findOne({
      userId: sellerUserId,
      isApproved: true,
      status: "approved",
    });

  if (!sellerProfile) {
    throw new ApiError(
      403,
      "An approved seller account is required.",
      "SELLER_ACCESS_REQUIRED",
    );
  }

  const products = getProductsCollection();

  const slug = await createUniqueProductSlug(
    input.name,
  );

  const now = new Date();

  const product: ProductDocument = {
    sellerId:
      sellerProfile._id.toHexString(),

    sellerUserId,

    name: input.name,
    slug,
    description: input.description,

    category: input.category,
    brand: input.brand ?? null,

    price: input.price,
    compareAtPrice:
      input.compareAtPrice ?? null,

    stock: input.stock,
    sku: input.sku ?? null,

    imageUrls: input.imageUrls,

    status: input.status,
    isFeatured: false,

    averageRating: 0,
    reviewCount: 0,
    totalSales: 0,

    createdAt: now,
    updatedAt: now,
  };

  const result =
    await products.insertOne(product);

  await sellerProfiles.updateOne(
    {
      _id: sellerProfile._id,
    },
    {
      $inc: {
        totalProducts: 1,
      },
      $set: {
        updatedAt: now,
      },
    },
  );

  return {
    ...product,
    _id: result.insertedId,
  };
}