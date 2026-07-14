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
  deleteSellerProductHandler,
  getPublicProductBySlugHandler,
  getPublicProductsHandler,
  getSellerProductByIdHandler,
  getSellerProductsHandler,
  updateSellerProductHandler,
} from "./product.controller.js";

export const productRouter = Router();

/*
 * Public routes
 */
productRouter.get(
  "/",
  getPublicProductsHandler,
);

productRouter.get(
  "/slug/:slug",
  getPublicProductBySlugHandler,
);

/*
 * Protected seller routes
 */
productRouter.use(
  authenticate,
  requireActiveUser,
  requireApprovedSeller,
);

productRouter.get(
  "/seller/me",
  getSellerProductsHandler,
);

productRouter.get(
  "/seller/me/:productId",
  getSellerProductByIdHandler,
);

productRouter.patch(
  "/seller/me/:productId",
  updateSellerProductHandler,
);

productRouter.delete(
  "/seller/me/:productId",
  deleteSellerProductHandler,
);

productRouter.post(
  "/",
  createProductHandler,
);