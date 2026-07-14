import { Router } from "express";
import { cartRouter } from "../modules/carts/cart.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { sellerApplicationRouter } from "../modules/seller-applications/seller-application.routes.js";
import { sellerRouter } from "../modules/sellers/seller.routes.js";
import { userRouter } from "../modules/users/user.routes.js";
import { productRouter } from "../modules/products/product.routes.js";
export const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.use("/seller-applications", sellerApplicationRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/sellers", sellerRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/cart", cartRouter);