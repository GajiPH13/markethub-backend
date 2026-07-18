import { Router } from "express";

import {
  authenticate,
} from "../../middleware/authenticate.js";
import {
  requireActiveUser,
} from "../../middleware/require-active-user.js";
import {
  requireApprovedSeller,
} from "../../middleware/require-approved-seller.js";
import {
  createOrderHandler,
  getAdminOrderByIdHandler,
  getAdminOrdersHandler,
  getCustomerOrderByIdHandler,
  getCustomerOrdersHandler,
  getSellerOrderByIdHandler,
  getSellerOrdersHandler,
  updateAdminOrderHandler,
  updateSellerOrderStatusHandler,
  cancelCustomerOrderHandler,
} from "./order.controller.js";
import { requireAdmin } from "../../middleware/permissions.js";

export const orderRouter = Router();

orderRouter.use(
  authenticate,
  requireActiveUser,
);

/*
 * Customer routes
 */
orderRouter.post(
  "/",
  createOrderHandler,
);

orderRouter.get(
  "/me",
  getCustomerOrdersHandler,
);

orderRouter.get(
  "/me/:orderId",
  getCustomerOrderByIdHandler,
);

orderRouter.patch(
  "/me/:orderId/cancel",
  cancelCustomerOrderHandler,
);
/*
 * Seller routes
 */
orderRouter.get(
  "/seller/me",
  requireApprovedSeller,
  getSellerOrdersHandler,
);

orderRouter.get(
  "/seller/me/:orderId",
  requireApprovedSeller,
  getSellerOrderByIdHandler,
);

orderRouter.patch(
  "/seller/me/:orderId/status",
  requireApprovedSeller,
  updateSellerOrderStatusHandler,
);
/*
 * Admin routes
 */
orderRouter.get(
  "/admin",
  requireAdmin,
  getAdminOrdersHandler,
);

orderRouter.get(
  "/admin/:orderId",
  requireAdmin,
  getAdminOrderByIdHandler,
);

orderRouter.patch(
  "/admin/:orderId",
  requireAdmin,
  updateAdminOrderHandler,
);