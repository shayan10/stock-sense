import { Request, Response, Router } from "express";
import { authController } from "../services/authentication/auth";
import { TokenVerificationError } from "../services/authentication/TokenService";
import { z } from "zod";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
	const { body } = req;

	try {
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
			sameSite: true,
			httpOnly: true,
		});

		res.status(200).send({ accessToken });
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).send(error.flatten().fieldErrors);
		} else {
			console.log(error);
			res.status(400).send(error);
		}
	}
});

router.post("/refresh", async (req: Request, res: Response) => {
	try {
		// Check if refresh token attached
		if (!req.cookies.refreshToken)
			res.status(401).send({ message: "Forbidden" });

		// Refresh Token
		const { accessToken, refreshToken } = await authController.refresh(
			req.cookies.refreshToken
		);

		res.clearCookie("refreshToken");
		res.cookie("refreshToken", "", {
			expires: new Date(0),
		});

		res.cookie("refreshToken", refreshToken, {
			sameSite: true,
			httpOnly: true,
		});

		res.status(200).send({
			accessToken,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).send(error.flatten().fieldErrors);
		} else if (error instanceof TokenVerificationError) {
			res.status(403).send();
		} else {
			res.status(400).send(error);
		}
	}
});

router.get("/logout", authMiddleware, async (req: Request, res: Response) => {
	try {
		// Check if refresh token attached
		if (!req.cookies.refreshToken || !req.headers.authorization) {
			res.status(401).send({ message: "Forbidden" });
			return;
		}

		authController.logout(
			req.headers.authorization,
			req.cookies.refreshToken
		);
		res.clearCookie("refreshToken");
		res.status(200).send();
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).send(error.flatten().fieldErrors);
		} else if (error instanceof TokenVerificationError) {
			res.status(401).send();
		} else {
			res.status(400).send(error);
		}
	}
});

export default router;
