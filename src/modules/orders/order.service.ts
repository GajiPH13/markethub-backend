import {
  ObjectId,
  type ClientSession,
  type WithId,
} from "mongodb";

import {
  getCartsCollection,
  getOrdersCollection,
  getProductsCollection,
} from "../../database/get-collections.js";
import {
  getMongoClient,
} from "../../database/mongodb.js";
import { ApiError } from "../../shared/errors/api-error.js";
import type {
  CreateOrderInput,
} from "./order.schema.js";
import type {
  OrderDocument,
  OrderItemDocument,
} from "./order.types.js";

function parseOrderId(
  orderId: string,
): ObjectId {
  if (!ObjectId.isValid(orderId)) {
    throw new ApiError(
      400,
      "Invalid order ID.",
      "INVALID_ORDER_ID",
    );
  }

  return new ObjectId(orderId);
}

function createOrderNumber(): string {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomPart = crypto.randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `MH-${datePart}-${randomPart}`;
}

async function buildOrderItems(
  customerUserId: string,
  session: ClientSession,
): Promise<{
  items: OrderItemDocument[];
  subtotal: number;
}> {
  const cart =
    await getCartsCollection().findOne(
      {
        userId: customerUserId,
      },
      {
        session,
      },
    );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(
      400,
      "Your cart is empty.",
      "CART_EMPTY",
    );
  }

  const validCartItems =
    cart.items.filter((item) =>
      ObjectId.isValid(item.productId),
    );

  if (
    validCartItems.length !==
    cart.items.length
  ) {
    throw new ApiError(
      400,
      "The cart contains an invalid product.",
      "INVALID_CART_PRODUCT",
    );
  }

  const productObjectIds =
    validCartItems.map(
      (item) =>
        new ObjectId(item.productId),
    );

  const products =
    await getProductsCollection()
      .find(
        {
          _id: {
            $in: productObjectIds,
          },
          status: "active",
        },
        {
          session,
        },
      )
      .toArray();

  const productMap = new Map(
    products.map((product) => [
      product._id.toHexString(),
      product,
    ]),
  );

  const items: OrderItemDocument[] = [];

  for (const cartItem of cart.items) {
    const product =
      productMap.get(
        cartItem.productId,
      );

    if (!product) {
      throw new ApiError(
        409,
        "One or more products are no longer available.",
        "PRODUCT_UNAVAILABLE",
      );
    }

    if (cartItem.quantity > product.stock) {
      throw new ApiError(
        409,
        `Only ${product.stock} item(s) of "${product.name}" are available.`,
        "INSUFFICIENT_STOCK",
      );
    }

    const lineTotal =
      product.price *
      cartItem.quantity;

    items.push({
      productId:
        product._id.toHexString(),

      sellerId: product.sellerId,
      sellerUserId:
        product.sellerUserId,

      name: product.name,
      slug: product.slug,

      imageUrl:
        product.imageUrls[0] ??
        null,

      sku: product.sku,

      price: product.price,
      quantity: cartItem.quantity,
      lineTotal,
    });
  }

  const subtotal = items.reduce(
    (total, item) =>
      total + item.lineTotal,
    0,
  );

  return {
    items,
    subtotal,
  };
}

export async function createCustomerOrder(
  customerUserId: string,
  input: CreateOrderInput,
): Promise<WithId<OrderDocument>> {
  const session =
    getMongoClient().startSession();

  try {
    let createdOrder:
      | WithId<OrderDocument>
      | undefined;

    await session.withTransaction(
      async () => {
        const {
          items,
          subtotal,
        } = await buildOrderItems(
          customerUserId,
          session,
        );

        for (const item of items) {
          const stockResult =
            await getProductsCollection().updateOne(
              {
                _id: new ObjectId(
                  item.productId,
                ),
                status: "active",
                stock: {
                  $gte: item.quantity,
                },
              },
              {
                $inc: {
                  stock: -item.quantity,
                  totalSales:
                    item.quantity,
                },
                $set: {
                  updatedAt: new Date(),
                },
              },
              {
                session,
              },
            );

          if (
            stockResult.modifiedCount === 0
          ) {
            throw new ApiError(
              409,
              `The stock for "${item.name}" changed. Please review your cart.`,
              "STOCK_CHANGED",
            );
          }
        }

        const shippingFee = 0;
        const taxAmount = 0;

        const totalAmount =
          subtotal +
          shippingFee +
          taxAmount;

        const now = new Date();

        const order: OrderDocument = {
          orderNumber:
            createOrderNumber(),

          customerUserId,

          items,

          shippingAddress: {
            fullName:
              input.shippingAddress
                .fullName,

            phone:
              input.shippingAddress
                .phone,

            addressLine1:
              input.shippingAddress
                .addressLine1,

            addressLine2:
              input.shippingAddress
                .addressLine2 ??
              null,

            city:
              input.shippingAddress
                .city,

            state:
              input.shippingAddress
                .state ??
              null,

            postalCode:
              input.shippingAddress
                .postalCode,

            country:
              input.shippingAddress
                .country,
          },

          subtotal,
          shippingFee,
          taxAmount,
          totalAmount,
          currency: "EUR",

          orderStatus: "pending",
          paymentStatus: "pending",

          customerNote:
            input.customerNote ??
            null,

          createdAt: now,
          updatedAt: now,
        };

        const insertResult =
          await getOrdersCollection().insertOne(
            order,
            {
              session,
            },
          );

        await getCartsCollection().updateOne(
          {
            userId: customerUserId,
          },
          {
            $set: {
              items: [],
              updatedAt: now,
            },
          },
          {
            session,
          },
        );

        createdOrder = {
          ...order,
          _id: insertResult.insertedId,
        };
      },
    );

    if (!createdOrder) {
      throw new ApiError(
        500,
        "Unable to create the order.",
        "ORDER_CREATION_FAILED",
      );
    }

    return createdOrder;
  } finally {
    await session.endSession();
  }
}

export async function getCustomerOrders({
  customerUserId,
  page,
  limit,
}: {
  customerUserId: string;
  page: number;
  limit: number;
}) {
  const orders = getOrdersCollection();

  const filter = {
    customerUserId,
  };

  const skip =
    (page - 1) * limit;

  const [items, total] =
    await Promise.all([
      orders
        .find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .toArray(),

      orders.countDocuments(filter),
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
          : Math.ceil(
              total / limit,
            ),
    },
  };
}

export async function getCustomerOrderById(
  orderId: string,
  customerUserId: string,
): Promise<WithId<OrderDocument>> {
  const id = parseOrderId(orderId);

  const order =
    await getOrdersCollection().findOne({
      _id: id,
      customerUserId,
    });

  if (!order) {
    throw new ApiError(
      404,
      "Order was not found.",
      "ORDER_NOT_FOUND",
    );
  }

  return order;
}