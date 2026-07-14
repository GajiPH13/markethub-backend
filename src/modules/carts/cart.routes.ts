import { Router } from "express";

import {
  authenticate,
} from "../../middleware/authenticate.js";
import {
  requireActiveUser,
} from "../../middleware/require-active-user.js";
import {
  addCartItemHandler,
  clearCartHandler,
  getCartHandler,
  removeCartItemHandler,
  updateCartItemHandler,
} from "./cart.controller.js";

export const cartRouter = Router();

cartRouter.use(
  authenticate,
  requireActiveUser,
);

cartRouter.get(
  "/me",
  getCartHandler,
);

cartRouter.post(
  "/items",
  addCartItemHandler,
);

cartRouter.patch(
  "/items/:productId",
  updateCartItemHandler,
);

cartRouter.delete(
  "/items/:productId",
  removeCartItemHandler,
);

cartRouter.delete(
  "/me",
  clearCartHandler,
);