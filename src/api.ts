import { Router } from "express";
import authRouter from "../src/routes/authRouter";
import userRouter from "../src/routes/userRouter";
import plaidRouter from "../src/routes/plaidRouter";
import accountRouter from "../src/routes/accountRouter";
import holdingRouter from "../src/routes/holdingRouter";

import { authMiddleware } from "./middlewares/authMiddleware";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/plaid", authMiddleware, plaidRouter);
router.use("/account", authMiddleware, accountRouter);
router.use("/holdings", authMiddleware, holdingRouter);

export default router;
