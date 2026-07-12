import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { requireActiveUser } from "../../middleware/require-active-user.js";
import { requireAdmin } from "../../middleware/permissions.js";
import { validateBody } from "../../middleware/validate-request.js";
import {
  approveApplication,
  listSellerApplications,
  rejectApplication,
} from "../seller-applications/seller-application.controller.js";
import { rejectSellerApplicationSchema } from "../seller-applications/seller-application.schema.js";

export const adminRouter = Router();

adminRouter.use(
  authenticate,
  requireActiveUser,
  requireAdmin,
);

adminRouter.get(
  "/seller-applications",
  listSellerApplications,
);

adminRouter.patch(
  "/seller-applications/:id/approve",
  approveApplication,
);

adminRouter.patch(
  "/seller-applications/:id/reject",
  validateBody(rejectSellerApplicationSchema),
  rejectApplication,
);