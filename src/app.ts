import express from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import userRouter from "./routes/userRouter";
import authRouter from "./routes/authRouter";
import plaidRouter from "./routes/plaidRouter";
import accountRouter from "./routes/accountRouter";
import holdingRouter from "./routes/holdingRouter";

import { authMiddleware } from "./middlewares/authMiddleware";

export const app = () => {
	const _app = express();

	_app.use(helmet());
	_app.use(bodyParser.json());
	_app.use(bodyParser.urlencoded({ extended: true }));
	_app.use(cookieParser());

	_app.use("/auth", authRouter);
	_app.use("/users", authMiddleware, userRouter);
	_app.use("/plaid", authMiddleware, plaidRouter);
	_app.use("/account", authMiddleware, accountRouter);
	_app.use("/holding", authMiddleware, holdingRouter);
	return _app;
};
