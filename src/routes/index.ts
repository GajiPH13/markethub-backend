import { Router } from "express";

import { userRouter } from "../modules/users/user.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { sellerRouter } from "../modules/sellers/seller.routes.js";

export const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/sellers", sellerRouter);