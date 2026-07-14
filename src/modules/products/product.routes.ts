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
  createProductHandler,
  getSellerProductsHandler,
} from "./product.controller.js";

export const productRouter = Router();

productRouter.use(
  authenticate,
  requireActiveUser,
  requireApprovedSeller,
);

productRouter.get(
  "/seller/me",
  getSellerProductsHandler,
);

productRouter.post(
  "/",
  createProductHandler,
);