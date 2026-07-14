import {
  ObjectId,
  type WithId,
} from "mongodb";

import {
  getCartsCollection,
  getProductsCollection,
} from "../../database/get-collections.js";
import { ApiError } from "../../shared/errors/api-error.js";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "../../modules/carts/cart.schema.js";
import type {
  CartDocument,
  PopulatedCart,
  PopulatedCartItem,
} from "./cart.types.js";

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

async function populateCart(
  cart: WithId<CartDocument> | null,
  userId: string,
): Promise<PopulatedCart> {
  if (!cart || cart.items.length === 0) {
    return {
      _id:
        cart?._id.toHexString() ??
        null,

      userId,
      items: [],
      totalItems: 0,
      subtotal: 0,

      createdAt:
        cart?.createdAt ?? null,

      updatedAt:
        cart?.updatedAt ?? null,
    };
  }

  const productIds =
    cart.items
      .filter((item) =>
        ObjectId.isValid(item.productId),
      )
      .map(
        (item) =>
          new ObjectId(item.productId),
      );

  const products =
    await getProductsCollection()
      .find({
        _id: {
          $in: productIds,
        },
        status: "active",
      })
      .toArray();

  const productsById = new Map(
    products.map((product) => [
      product._id.toHexString(),
      product,
    ]),
  );

  const items: PopulatedCartItem[] = [];

  for (const cartItem of cart.items) {
    const product =
      productsById.get(
        cartItem.productId,
      );

    if (!product) {
      continue;
    }

    const quantity = Math.min(
      cartItem.quantity,
      product.stock,
    );

    if (quantity <= 0) {
      continue;
    }

    items.push({
      productId:
        product._id.toHexString(),

      quantity,

      name: product.name,
      slug: product.slug,

      imageUrl:
        product.imageUrls[0] ??
        null,

      price: product.price,
      stock: product.stock,

      lineTotal:
        product.price * quantity,
    });
  }

  const totalItems = items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );

  const subtotal = items.reduce(
    (total, item) =>
      total + item.lineTotal,
    0,
  );

  return {
    _id: cart._id.toHexString(),
    userId,
    items,
    totalItems,
    subtotal,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

export async function getUserCart(
  userId: string,
): Promise<PopulatedCart> {
  const cart =
    await getCartsCollection().findOne({
      userId,
    });

  return populateCart(
    cart,
    userId,
  );
}

export async function addItemToCart(
  userId: string,
  input: AddCartItemInput,
): Promise<PopulatedCart> {
  const productObjectId =
    parseProductId(input.productId);

  const product =
    await getProductsCollection().findOne({
      _id: productObjectId,
      status: "active",
    });

  if (!product) {
    throw new ApiError(
      404,
      "Product was not found.",
      "PRODUCT_NOT_FOUND",
    );
  }

  if (product.stock <= 0) {
    throw new ApiError(
      409,
      "This product is out of stock.",
      "PRODUCT_OUT_OF_STOCK",
    );
  }

  const carts = getCartsCollection();

  const existingCart =
    await carts.findOne({
      userId,
    });

  const existingItem =
    existingCart?.items.find(
      (item) =>
        item.productId === input.productId,
    );

  const nextQuantity =
    (existingItem?.quantity ?? 0) +
    input.quantity;

  if (nextQuantity > product.stock) {
    throw new ApiError(
      409,
      `Only ${product.stock} item(s) are available.`,
      "INSUFFICIENT_STOCK",
    );
  }

  const now = new Date();

  if (!existingCart) {
    const cart: CartDocument = {
      userId,
      items: [
        {
          productId: input.productId,
          quantity: input.quantity,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const result =
      await carts.insertOne(cart);

    return populateCart(
      {
        ...cart,
        _id: result.insertedId,
      },
      userId,
    );
  }

  if (existingItem) {
    await carts.updateOne(
      {
        _id: existingCart._id,
        "items.productId":
          input.productId,
      },
      {
        $set: {
          "items.$.quantity":
            nextQuantity,
          updatedAt: now,
        },
      },
    );
  } else {
    await carts.updateOne(
      {
        _id: existingCart._id,
      },
      {
        $push: {
          items: {
            productId:
              input.productId,
            quantity:
              input.quantity,
          },
        },
        $set: {
          updatedAt: now,
        },
      },
    );
  }

  const updatedCart =
    await carts.findOne({
      _id: existingCart._id,
    });

  return populateCart(
    updatedCart,
    userId,
  );
}

export async function updateCartItem(
  userId: string,
  productId: string,
  input: UpdateCartItemInput,
): Promise<PopulatedCart> {
  const productObjectId =
    parseProductId(productId);

  const product =
    await getProductsCollection().findOne({
      _id: productObjectId,
      status: "active",
    });

  if (!product) {
    throw new ApiError(
      404,
      "Product was not found.",
      "PRODUCT_NOT_FOUND",
    );
  }

  if (input.quantity > product.stock) {
    throw new ApiError(
      409,
      `Only ${product.stock} item(s) are available.`,
      "INSUFFICIENT_STOCK",
    );
  }

  const carts = getCartsCollection();

  const updateResult =
    await carts.updateOne(
      {
        userId,
        "items.productId": productId,
      },
      {
        $set: {
          "items.$.quantity":
            input.quantity,
          updatedAt: new Date(),
        },
      },
    );

  if (updateResult.matchedCount === 0) {
    throw new ApiError(
      404,
      "Cart item was not found.",
      "CART_ITEM_NOT_FOUND",
    );
  }

  const updatedCart =
    await carts.findOne({
      userId,
    });

  return populateCart(
    updatedCart,
    userId,
  );
}

export async function removeCartItem(
  userId: string,
  productId: string,
): Promise<PopulatedCart> {
  parseProductId(productId);

  const carts = getCartsCollection();

  const updateResult =
    await carts.updateOne(
      {
        userId,
        "items.productId": productId,
      },
      {
        $pull: {
          items: {
            productId,
          },
        },
        $set: {
          updatedAt: new Date(),
        },
      },
    );

  if (updateResult.matchedCount === 0) {
    throw new ApiError(
      404,
      "Cart item was not found.",
      "CART_ITEM_NOT_FOUND",
    );
  }

  const updatedCart =
    await carts.findOne({
      userId,
    });

  return populateCart(
    updatedCart,
    userId,
  );
}

export async function clearUserCart(
  userId: string,
): Promise<PopulatedCart> {
  const carts = getCartsCollection();

  await carts.updateOne(
    {
      userId,
    },
    {
      $set: {
        items: [],
        updatedAt: new Date(),
      },
    },
  );

  const updatedCart =
    await carts.findOne({
      userId,
    });

  return populateCart(
    updatedCart,
    userId,
  );
}