import { Request, Response, Router } from "express";
import { accountRepo } from "../services/accounts/AccountRepo";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { user_id } = req.body;

	// Send 401 status to unauthenticated user
	if (!user_id) {
		res.status(401).send({ message: "Forbidden" });
	}

	// Fetch the user accounts
	const results = await accountRepo.get(parseInt(user_id));
	res.status(200).send(results);
});

export default router;
