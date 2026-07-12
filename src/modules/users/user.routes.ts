import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { requireActiveUser } from "../../middleware/require-active-user.js";
import { getCurrentUser } from "./user.controller.js";

export const userRouter = Router();

userRouter.get(
  "/me",
  authenticate,
  requireActiveUser,
  getCurrentUser,
);