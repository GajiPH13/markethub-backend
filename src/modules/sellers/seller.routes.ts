import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { requireActiveUser } from "../../middleware/require-active-user.js";
import { requireApprovedSeller } from "../../middleware/require-approved-seller.js";

export const sellerRouter = Router();

sellerRouter.get(
  "/test",
  authenticate,
  requireActiveUser,
  requireApprovedSeller,
  (_request, response) => {
    response.status(200).json({
      success: true,
      message: "Approved seller authorization succeeded.",
    });
  },
);