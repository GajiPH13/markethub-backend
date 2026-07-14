import { Router } from "express";

import {
  authenticate,
} from "../../middleware/authenticate.js";
import {
  requireActiveUser,
} from "../../middleware/require-active-user.js";
import {
  createOrderHandler,
  getCustomerOrderByIdHandler,
  getCustomerOrdersHandler,
} from "./order.controller.js";

export const orderRouter = Router();

orderRouter.use(
  authenticate,
  requireActiveUser,
);

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