import { Request, Response, Router } from "express";
import { authController } from "../services/authentication/auth";
import { z } from "zod";
import { authMiddleware } from "../middlewares/authMiddleware";
import { BaseError } from "../errors/customError";
import { NextFunction } from "express";

const router = Router();

router.post(
	"/login",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { body } = req;

			// Validate username and password
			const { username, password } = z
				.object({
					username: z.string(),
					password: z.string(),
				})
				.strip()
				.parse(body);

			const { accessToken, refreshToken } =
				await authController.authenticate(username, password);

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
			});

			res.status(200).send({ accessToken });
		} catch (error) {
			next(error);
		}
	}
);

router.get(
	"/refresh",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Check if refresh token attached
			if (!req.cookies.refreshToken)
				next(
					new BaseError(
						"No refresh token specified",
						"refresh_token_not_provided",
						"No refresh token present in the request",
						401
					)
				);

			// Refresh Token
			const { accessToken, refreshToken } =
				await authController.refresh(req.cookies.refreshToken);

			res.clearCookie("refreshToken");

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
			});

			res.status(200).send({
				accessToken,
			});
		} catch (error) {
			next(error);
		}
	}
);

router.get(
	"/logout",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Check if refresh token attached
			if (!req.cookies.refreshToken || !req.headers.authorization) {
				res.status(401).send({ message: "Forbidden" });
				return;
			}

			await authController.logout(
				req.headers.authorization,
				req.cookies.refreshToken
			);
			res.clearCookie("refreshToken");
			res.status(204).send();
		} catch (error) {
			next(error);
		}
	}
);

export default router;
