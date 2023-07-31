import { Request, Response, Router } from "express";
import { User, UserNotFound } from "../services/users/User";
import { NoArgumentsProvidedException, validate } from "../utiils";
import { userUpdateSchema } from "../services/users/UserSchema";
import { userSchema } from "../services/users/UserSchema";
import { z } from "zod";

import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
	const { body } = req;
	try {
		const sanitizedInput = await validate(userSchema, body);
		const user = await User.insert(sanitizedInput);
		res.send(user);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).send(error.flatten().fieldErrors);
		}
	}
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
	try {
		const { user_id } = req.body;
		const user = await User.get(user_id);
		res.send(user);
	} catch (error) {
		if (error instanceof UserNotFound) {
			res.status(404).send({ error: "User not found" });
		} else {
			res.status(400).send(error);
		}
	}
});

router.patch("/", authMiddleware, async (req: Request, res: Response) => {
	const { body } = req;
	try {
		const { user_id } = body;
		delete body.user_id;

		const sanitizedInput = await validate(userUpdateSchema, body);
		const user = await User.update(user_id, sanitizedInput);
		res.status(200).send(user);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).send(error.flatten().fieldErrors);
		} else if (error instanceof UserNotFound) {
			return res.status(404).send({
				message: "User not found",
			});
		} else if (error instanceof NoArgumentsProvidedException) {
			return res.status(400).send({
				message: "No arguments provided",
			});
		}
	}
});

export default router;
