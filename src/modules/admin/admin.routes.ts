import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { requireAdmin } from "../../middleware/permissions.js";
import { requireActiveUser } from "../../middleware/require-active-user.js";

export const adminRouter = Router();

adminRouter.get(
  "/test",
  authenticate,
  requireActiveUser,
  requireAdmin,
  (request, response) => {
    response.status(200).json({
      success: true,
      message: "Admin authorization succeeded.",
    });
  },
);