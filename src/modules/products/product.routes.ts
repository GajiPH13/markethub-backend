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
} from "./product.controller.js";

export const productRouter = Router();

productRouter.post(
  "/",
  authenticate,
  requireActiveUser,
  requireApprovedSeller,
  createProductHandler,
);