import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { requireActiveUser } from "../../middleware/require-active-user.js";
import { requireCustomer } from "../../middleware/permissions.js";
import { validateBody } from "../../middleware/validate-request.js";
import {
  getOwnSellerApplication,
  submitSellerApplication,
} from "./seller-application.controller.js";
import { createSellerApplicationSchema } from "./seller-application.schema.js";

export const sellerApplicationRouter = Router();

sellerApplicationRouter.post(
  "/",
  authenticate,
  requireActiveUser,
  requireCustomer,
  validateBody(createSellerApplicationSchema),
  submitSellerApplication,
);

sellerApplicationRouter.get(
  "/me",
  authenticate,
  requireActiveUser,
  requireCustomer,
  getOwnSellerApplication,
);