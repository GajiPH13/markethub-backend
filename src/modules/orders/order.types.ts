import type { ObjectId } from "mongodb";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type SellerOrderItemStatus =
  "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
}

export interface OrderItemDocument {
  productId: string;
  sellerId: string;
  sellerUserId: string;

  name: string;
  slug: string;
  imageUrl: string | null;
  sku: string | null;

  price: number;
  quantity: number;
  lineTotal: number;

  fulfillmentStatus: SellerOrderItemStatus;
}

export interface OrderDocument {
  _id?: ObjectId;

  orderNumber: string;
  customerUserId: string;

  items: OrderItemDocument[];
  shippingAddress: ShippingAddress;

  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: "EUR";

  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  customerNote: string | null;

  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;

  createdAt: Date;
  updatedAt: Date;
}
export interface SellerOrderView {
  _id: string;
  orderNumber: string;
  customerUserId: string;

  items: OrderItemDocument[];

  shippingAddress: ShippingAddress;

  sellerSubtotal: number;
  currency: "EUR";

  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  customerNote: string | null;

  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;

  createdAt: Date;
  updatedAt: Date;
}
export interface AdminOrderView {
  _id: string;

  orderNumber: string;
  customerUserId: string;

  items: OrderItemDocument[];
  shippingAddress: ShippingAddress;

  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: "EUR";

  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  customerNote: string | null;

  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;

  createdAt: Date;
  updatedAt: Date;
}
