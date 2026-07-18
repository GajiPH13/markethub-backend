import {
  ObjectId,
  type ClientSession,
  type Filter,
  type WithId,
} from "mongodb";

import {
  getCartsCollection,
  getOrdersCollection,
  getProductsCollection,
} from "../../database/get-collections.js";
import { getMongoClient } from "../../database/mongodb.js";
import { ApiError } from "../../shared/errors/api-error.js";
import type {
  AdminOrderQueryInput,
  CancelCustomerOrderInput,
  CreateOrderInput,
  SellerOrderStatus,
  UpdateAdminOrderStatusInput,
} from "./order.schema.js";
import type {
  AdminOrderView,
  OrderDocument,
  OrderItemDocument,
  OrderStatus,
  PaymentStatus,
  SellerOrderView,
} from "./order.types.js";

function parseOrderId(orderId: string): ObjectId {
  if (!ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID.", "INVALID_ORDER_ID");
  }

  return new ObjectId(orderId);
}

function createOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  const randomPart = crypto
    .randomUUID()
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
  const cart = await getCartsCollection().findOne(
    {
      userId: customerUserId,
    },
    {
      session,
    },
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty.", "CART_EMPTY");
  }

  const validCartItems = cart.items.filter((item) =>
    ObjectId.isValid(item.productId),
  );

  if (validCartItems.length !== cart.items.length) {
    throw new ApiError(
      400,
      "The cart contains an invalid product.",
      "INVALID_CART_PRODUCT",
    );
  }

  const productObjectIds = validCartItems.map(
    (item) => new ObjectId(item.productId),
  );

  const products = await getProductsCollection()
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
    products.map((product) => [product._id.toHexString(), product]),
  );

  const items: OrderItemDocument[] = [];

  for (const cartItem of cart.items) {
    const product = productMap.get(cartItem.productId);

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

    const lineTotal = product.price * cartItem.quantity;

    items.push({
      productId: product._id.toHexString(),

      sellerId: product.sellerId,

      sellerUserId: product.sellerUserId,

      name: product.name,
      slug: product.slug,

      imageUrl: product.imageUrls[0] ?? null,

      sku: product.sku,

      price: product.price,

      quantity: cartItem.quantity,

      lineTotal,

      fulfillmentStatus: "pending",
    });
  }

  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  return {
    items,
    subtotal,
  };
}

export async function createCustomerOrder(
  customerUserId: string,
  input: CreateOrderInput,
): Promise<WithId<OrderDocument>> {
  const session = getMongoClient().startSession();

  try {
    let createdOrder: WithId<OrderDocument> | undefined;

    await session.withTransaction(async () => {
      const { items, subtotal } = await buildOrderItems(
        customerUserId,
        session,
      );

      for (const item of items) {
        const stockResult = await getProductsCollection().updateOne(
          {
            _id: new ObjectId(item.productId),
            status: "active",
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,

              totalSales: item.quantity,
            },
            $set: {
              updatedAt: new Date(),
            },
          },
          {
            session,
          },
        );

        if (stockResult.modifiedCount === 0) {
          throw new ApiError(
            409,
            `The stock for "${item.name}" changed. Please review your cart.`,
            "STOCK_CHANGED",
          );
        }
      }

      const shippingFee = 0;
      const taxAmount = 0;

      const totalAmount = subtotal + shippingFee + taxAmount;

      const now = new Date();

      const order: OrderDocument = {
        orderNumber: createOrderNumber(),

        customerUserId,

        items,

        shippingAddress: {
          fullName: input.shippingAddress.fullName,

          phone: input.shippingAddress.phone,

          addressLine1: input.shippingAddress.addressLine1,

          addressLine2: input.shippingAddress.addressLine2 ?? null,

          city: input.shippingAddress.city,

          state: input.shippingAddress.state ?? null,

          postalCode: input.shippingAddress.postalCode,

          country: input.shippingAddress.country,
        },

        subtotal,
        shippingFee,
        taxAmount,
        totalAmount,

        currency: "EUR",

        orderStatus: "pending",
        paymentStatus: "pending",

        customerNote: input.customerNote ?? null,

        cancellationReason: null,
        cancelledAt: null,
        cancelledBy: null,

        createdAt: now,
        updatedAt: now,
      };

      const insertResult = await getOrdersCollection().insertOne(order, {
        session,
      });

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
    });

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

  const filter: Filter<OrderDocument> = {
    customerUserId,
  };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
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

      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

export async function getCustomerOrderById(
  orderId: string,
  customerUserId: string,
): Promise<WithId<OrderDocument>> {
  const id = parseOrderId(orderId);

  const order = await getOrdersCollection().findOne({
    _id: id,
    customerUserId,
  });

  if (!order) {
    throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
  }

  return order;
}

function buildSellerOrderView(
  order: WithId<OrderDocument>,
  sellerUserId: string,
): SellerOrderView {
  const sellerItems = order.items.filter(
    (item) => item.sellerUserId === sellerUserId,
  );

  const sellerSubtotal = sellerItems.reduce(
    (total, item) => total + item.lineTotal,
    0,
  );

  return {
    _id: order._id.toHexString(),

    orderNumber: order.orderNumber,

    customerUserId: order.customerUserId,

    items: sellerItems,

    shippingAddress: order.shippingAddress,

    sellerSubtotal,

    currency: order.currency,

    orderStatus: order.orderStatus,

    paymentStatus: order.paymentStatus,

    customerNote: order.customerNote,

    cancellationReason: order.cancellationReason,

    cancelledAt: order.cancelledAt,

    cancelledBy: order.cancelledBy,

    createdAt: order.createdAt,

    updatedAt: order.updatedAt,
  };
}

function calculateOverallOrderStatus(items: OrderItemDocument[]): OrderStatus {
  const statuses = items.map((item) => item.fulfillmentStatus ?? "pending");

  if (statuses.every((status) => status === "cancelled")) {
    return "cancelled";
  }

  if (
    statuses.every((status) => status === "delivered" || status === "cancelled")
  ) {
    return "delivered";
  }

  if (statuses.some((status) => status === "shipped")) {
    return "shipped";
  }

  if (statuses.some((status) => status === "processing")) {
    return "processing";
  }

  return "pending";
}

export async function getSellerOrders({
  sellerUserId,
  status,
  page,
  limit,
}: {
  sellerUserId: string;
  status?: SellerOrderStatus;
  page: number;
  limit: number;
}) {
  const orders = getOrdersCollection();

  const filter: Filter<OrderDocument> = {
    "items.sellerUserId": sellerUserId,
  };

  if (status !== undefined) {
    filter.items = {
      $elemMatch: {
        sellerUserId,
        fulfillmentStatus: status,
      },
    };
  }

  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
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
    items: documents.map((order) => buildSellerOrderView(order, sellerUserId)),

    pagination: {
      page,
      limit,
      total,

      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

export async function getSellerOrderById(
  orderId: string,
  sellerUserId: string,
): Promise<SellerOrderView> {
  const id = parseOrderId(orderId);

  const order = await getOrdersCollection().findOne({
    _id: id,

    "items.sellerUserId": sellerUserId,
  });

  if (!order) {
    throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
  }

  return buildSellerOrderView(order, sellerUserId);
}

const SELLER_STATUS_TRANSITIONS: Record<
  SellerOrderStatus,
  SellerOrderStatus[]
> = {
  pending: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function updateSellerOrderStatus(
  orderId: string,
  sellerUserId: string,
  nextStatus: SellerOrderStatus,
): Promise<SellerOrderView> {
  const id = parseOrderId(orderId);

  const orders = getOrdersCollection();

  const order = await orders.findOne({
    _id: id,

    "items.sellerUserId": sellerUserId,
  });

  if (!order) {
    throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
  }

  const sellerItems = order.items.filter(
    (item) => item.sellerUserId === sellerUserId,
  );

  if (sellerItems.length === 0) {
    throw new ApiError(
      403,
      "You do not have access to this order.",
      "SELLER_ORDER_ACCESS_DENIED",
    );
  }
  if (order.paymentStatus === "paid") {
    throw new ApiError(
      409,
      "Paid orders require an admin refund before cancellation.",
      "PAID_ORDER_CANCELLATION_REQUIRES_REFUND",
    );
  }

  for (const item of sellerItems) {
    const currentStatus = item.fulfillmentStatus ?? "pending";

    if (currentStatus === nextStatus) {
      continue;
    }

    const allowedStatuses = SELLER_STATUS_TRANSITIONS[currentStatus];

    if (!allowedStatuses.includes(nextStatus)) {
      throw new ApiError(
        409,
        `Cannot change fulfillment status from "${currentStatus}" to "${nextStatus}".`,
        "INVALID_ORDER_STATUS_TRANSITION",
      );
    }
  }

  const now = new Date();

  const updateResult = await orders.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        "items.$[sellerItem].fulfillmentStatus": nextStatus,

        updatedAt: now,
      },
    },
    {
      arrayFilters: [
        {
          "sellerItem.sellerUserId": sellerUserId,
        },
      ],
    },
  );

  if (updateResult.matchedCount === 0) {
    throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
  }

  const updatedOrder = await orders.findOne({
    _id: id,
  });

  if (!updatedOrder) {
    throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
  }

  const overallOrderStatus = calculateOverallOrderStatus(updatedOrder.items);

  if (updatedOrder.orderStatus !== overallOrderStatus) {
    await orders.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          orderStatus: overallOrderStatus,

          updatedAt: now,
        },
      },
    );

    updatedOrder.orderStatus = overallOrderStatus;

    updatedOrder.updatedAt = now;
  }

  return buildSellerOrderView(updatedOrder, sellerUserId);
}

function buildAdminOrderView(order: WithId<OrderDocument>): AdminOrderView {
  return {
    _id: order._id.toHexString(),

    orderNumber: order.orderNumber,

    customerUserId: order.customerUserId,

    items: order.items,

    shippingAddress: order.shippingAddress,

    subtotal: order.subtotal,

    shippingFee: order.shippingFee,

    taxAmount: order.taxAmount,

    totalAmount: order.totalAmount,

    currency: order.currency,

    orderStatus: order.orderStatus,

    paymentStatus: order.paymentStatus,

    customerNote: order.customerNote,

    cancellationReason: order.cancellationReason,

    cancelledAt: order.cancelledAt,

    cancelledBy: order.cancelledBy,

    createdAt: order.createdAt,

    updatedAt: order.updatedAt,
  };
}

export async function getAdminOrders({
  search,
  orderStatus,
  paymentStatus,
  page,
  limit,
}: AdminOrderQueryInput) {
  const orders = getOrdersCollection();

  const filter: Filter<OrderDocument> = {};

  if (search) {
    filter.orderNumber = {
      $regex: search,
      $options: "i",
    };
  }

  if (orderStatus) {
    filter.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
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
    items: documents.map(buildAdminOrderView),

    pagination: {
      page,
      limit,
      total,

      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

export async function getAdminOrderById(
  orderId: string,
): Promise<AdminOrderView> {
  const id = parseOrderId(orderId);

  const order = await getOrdersCollection().findOne({
    _id: id,
  });

  if (!order) {
    throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
  }

  return buildAdminOrderView(order);
}

const ADMIN_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "processing", "cancelled"],

  confirmed: ["processing", "cancelled"],

  processing: ["shipped", "cancelled"],

  shipped: ["delivered"],

  delivered: [],

  cancelled: [],
};

const ADMIN_PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> =
  {
    pending: ["paid", "failed"],

    paid: ["refunded"],

    failed: ["pending"],

    refunded: [],
  };

export async function updateAdminOrder(
  orderId: string,
  input: UpdateAdminOrderStatusInput,
): Promise<AdminOrderView> {
  const id = parseOrderId(orderId);

  const orders = getOrdersCollection();

  const existingOrder = await orders.findOne({
    _id: id,
  });

  if (!existingOrder) {
    throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
  }

  const update: Partial<OrderDocument> = {
    updatedAt: new Date(),
  };

  if (input.orderStatus !== undefined) {
    const currentStatus = existingOrder.orderStatus;

    if (input.orderStatus !== currentStatus) {
      const allowedStatuses = ADMIN_ORDER_STATUS_TRANSITIONS[currentStatus];

      if (!allowedStatuses.includes(input.orderStatus)) {
        throw new ApiError(
          409,
          `Cannot change order status from "${currentStatus}" to "${input.orderStatus}".`,
          "INVALID_ORDER_STATUS_TRANSITION",
        );
      }

      update.orderStatus = input.orderStatus;
    }
  }

  if (input.paymentStatus !== undefined) {
    const currentPaymentStatus = existingOrder.paymentStatus;

    if (input.paymentStatus !== currentPaymentStatus) {
      const allowedStatuses =
        ADMIN_PAYMENT_STATUS_TRANSITIONS[currentPaymentStatus];

      if (!allowedStatuses.includes(input.paymentStatus)) {
        throw new ApiError(
          409,
          `Cannot change payment status from "${currentPaymentStatus}" to "${input.paymentStatus}".`,
          "INVALID_PAYMENT_STATUS_TRANSITION",
        );
      }

      update.paymentStatus = input.paymentStatus;
    }
  }

  const updatedOrder = await orders.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $set: update,
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedOrder) {
    throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
  }

  return buildAdminOrderView(updatedOrder);
}

const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = ["pending", "confirmed"];

export async function cancelCustomerOrder(
  orderId: string,
  customerUserId: string,
  input: CancelCustomerOrderInput,
): Promise<WithId<OrderDocument>> {
  const id = parseOrderId(orderId);

  const session = getMongoClient().startSession();

  try {
    let cancelledOrder: WithId<OrderDocument> | undefined;

    await session.withTransaction(async () => {
      const orders = getOrdersCollection();

      const products = getProductsCollection();

      const order = await orders.findOne(
        {
          _id: id,
          customerUserId,
        },
        {
          session,
        },
      );

      if (!order) {
        throw new ApiError(404, "Order was not found.", "ORDER_NOT_FOUND");
      }

      if (order.orderStatus === "cancelled") {
        throw new ApiError(
          409,
          "This order has already been cancelled.",
          "ORDER_ALREADY_CANCELLED",
        );
      }

      if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.orderStatus)) {
        throw new ApiError(
          409,
          "This order can no longer be cancelled by the customer.",
          "ORDER_CANCELLATION_NOT_ALLOWED",
        );
      }

      if (order.paymentStatus === "paid") {
        throw new ApiError(
          409,
          "Paid orders require an admin refund before cancellation.",
          "PAID_ORDER_CANCELLATION_REQUIRES_REFUND",
        );
      }

      const hasStartedFulfillment = order.items.some((item) => {
        const status = item.fulfillmentStatus ?? "pending";

        return (
          status === "processing" ||
          status === "shipped" ||
          status === "delivered"
        );
      });

      if (hasStartedFulfillment) {
        throw new ApiError(
          409,
          "This order is already being fulfilled and cannot be cancelled.",
          "ORDER_FULFILLMENT_STARTED",
        );
      }

      const now = new Date();

      for (const item of order.items) {
        if (!ObjectId.isValid(item.productId)) {
          throw new ApiError(
            500,
            "The order contains an invalid product reference.",
            "INVALID_ORDER_PRODUCT",
          );
        }

        const product = await products.findOne(
          {
            _id: new ObjectId(item.productId),
          },
          {
            session,
          },
        );

        if (!product) {
          throw new ApiError(
            500,
            `Unable to find "${item.name}" while restoring stock.`,
            "STOCK_RESTORE_FAILED",
          );
        }

        const nextTotalSales = Math.max(0, product.totalSales - item.quantity);

        const restoreResult = await products.updateOne(
          {
            _id: product._id,
          },
          {
            $inc: {
              stock: item.quantity,
            },
            $set: {
              totalSales: nextTotalSales,

              updatedAt: now,
            },
          },
          {
            session,
          },
        );

        if (restoreResult.matchedCount === 0) {
          throw new ApiError(
            500,
            `Unable to restore stock for "${item.name}".`,
            "STOCK_RESTORE_FAILED",
          );
        }
      }

      const updateResult = await orders.findOneAndUpdate(
        {
          _id: id,
          customerUserId,

          orderStatus: {
            $in: CUSTOMER_CANCELLABLE_STATUSES,
          },
        },
        {
          $set: {
            orderStatus: "cancelled",

            "items.$[].fulfillmentStatus": "cancelled",

            cancellationReason: input.reason ?? null,

            cancelledAt: now,

            cancelledBy: customerUserId,

            updatedAt: now,
          },
        },
        {
          returnDocument: "after",

          session,
        },
      );

      if (!updateResult) {
        throw new ApiError(
          409,
          "The order status changed before cancellation could be completed.",
          "ORDER_STATUS_CHANGED",
        );
      }

      cancelledOrder = updateResult;
    });

    if (!cancelledOrder) {
      throw new ApiError(
        500,
        "Unable to cancel the order.",
        "ORDER_CANCELLATION_FAILED",
      );
    }

    return cancelledOrder;
  } finally {
    await session.endSession();
  }
}
