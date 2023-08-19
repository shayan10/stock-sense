import { NextFunction, Request, Response, Router } from "express";
import { user as userService } from "../services/users/User";
import { validate } from "../utiils";
import { userUpdateSchema } from "../services/users/UserSchema";
import { userSchema } from "../services/users/UserSchema";

import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post(
	"/register",
	async (req: Request, res: Response, next: NextFunction) => {
		const { body } = req;
		try {
			const sanitizedInput = await validate(userSchema, body);
			const user = await userService.insert(sanitizedInput);
			res.send(user);
		} catch (error) {
			next(error);
		}
	}
);

router.get(
	"/",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { user_id } = req.body;
			const user = await userService.get(user_id);
			res.send(user);
		} catch (error) {
			next(error);
		}
	}
);

router.patch(
	"/",
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		const { body } = req;
		try {
			const { user_id } = body;
			delete body.user_id;

			const sanitizedInput = await validate(userUpdateSchema, body);
			const user = await userService.update(user_id, sanitizedInput);
			res.status(200).send(user);
		} catch (error) {
			next(error);
		}
	}
);

export default router;
