
import {
  ObjectId,
  type Filter,
  type WithId,
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
  UpdateProductInput,
} from "./product.schema.js";
import type {
  ProductDocument,
  ProductStatus,
} from "./product.types.js";

interface GetSellerProductsOptions {
  sellerUserId: string;
  status?: ProductStatus;
  page: number;
  limit: number;
}

function parseProductId(
  productId: string,
): ObjectId {
  if (!ObjectId.isValid(productId)) {
    throw new ApiError(
      400,
      "Invalid product ID.",
      "INVALID_PRODUCT_ID",
    );
  }

  return new ObjectId(productId);
}

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

async function createUniqueProductSlugForUpdate(
  productName: string,
  productId: ObjectId,
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
        _id: {
          $ne: productId,
        },
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

export async function getSellerProducts({
  sellerUserId,
  status,
  page,
  limit,
}: GetSellerProductsOptions) {
  const products = getProductsCollection();

  const filter: Filter<ProductDocument> = {
    sellerUserId,
  };

  if (status !== undefined) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    products
      .find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .toArray(),

    products.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages:
        total === 0
          ? 0
          : Math.ceil(total / limit),
    },
  };
}

export async function getSellerProductById(
  productId: string,
  sellerUserId: string,
): Promise<WithId<ProductDocument>> {
  const id = parseProductId(productId);

  const product =
    await getProductsCollection().findOne({
      _id: id,
      sellerUserId,
    });

  if (!product) {
    throw new ApiError(
      404,
      "Product was not found.",
      "PRODUCT_NOT_FOUND",
    );
  }

  return product;
}

export async function updateSellerProduct(
  productId: string,
  sellerUserId: string,
  input: UpdateProductInput,
): Promise<WithId<ProductDocument>> {
  const id = parseProductId(productId);

  const products = getProductsCollection();

  const existingProduct =
    await products.findOne({
      _id: id,
      sellerUserId,
    });

  if (!existingProduct) {
    throw new ApiError(
      404,
      "Product was not found.",
      "PRODUCT_NOT_FOUND",
    );
  }

  const nextPrice =
    input.price ??
    existingProduct.price;

  const nextCompareAtPrice =
    input.compareAtPrice !== undefined
      ? input.compareAtPrice
      : existingProduct.compareAtPrice;

  if (
    nextCompareAtPrice !== null &&
    nextCompareAtPrice <= nextPrice
  ) {
    throw new ApiError(
      400,
      "Compare-at price must be greater than the regular price.",
      "INVALID_COMPARE_AT_PRICE",
    );
  }

  const update: Partial<ProductDocument> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) {
    update.name = input.name;

    if (
      input.name !== existingProduct.name
    ) {
      update.slug =
        await createUniqueProductSlugForUpdate(
          input.name,
          id,
        );
    }
  }

  if (input.description !== undefined) {
    update.description =
      input.description;
  }

  if (input.category !== undefined) {
    update.category = input.category;
  }

  if (input.brand !== undefined) {
    update.brand =
      input.brand ?? null;
  }

  if (input.price !== undefined) {
    update.price = input.price;
  }

  if (
    input.compareAtPrice !== undefined
  ) {
    update.compareAtPrice =
      input.compareAtPrice;
  }

  if (input.stock !== undefined) {
    update.stock = input.stock;
  }

  if (input.sku !== undefined) {
    update.sku =
      input.sku ?? null;
  }

  if (input.imageUrls !== undefined) {
    update.imageUrls =
      input.imageUrls;
  }

  if (input.status !== undefined) {
    update.status = input.status;
  }

  const updatedProduct =
    await products.findOneAndUpdate(
      {
        _id: id,
        sellerUserId,
      },
      {
        $set: update,
      },
      {
        returnDocument: "after",
      },
    );

  if (!updatedProduct) {
    throw new ApiError(
      404,
      "Product was not found.",
      "PRODUCT_NOT_FOUND",
    );
  }

  return updatedProduct;
}

export async function deleteSellerProduct(
  productId: string,
  sellerUserId: string,
): Promise<void> {
  const id = parseProductId(productId);

  const products = getProductsCollection();

  const deleteResult =
    await products.deleteOne({
      _id: id,
      sellerUserId,
    });

  if (deleteResult.deletedCount === 0) {
    throw new ApiError(
      404,
      "Product was not found.",
      "PRODUCT_NOT_FOUND",
    );
  }

  await getSellerProfilesCollection().updateOne(
    {
      userId: sellerUserId,
      totalProducts: {
        $gt: 0,
      },
    },
    {
      $inc: {
        totalProducts: -1,
      },
      $set: {
        updatedAt: new Date(),
      },
    },
  );
}
