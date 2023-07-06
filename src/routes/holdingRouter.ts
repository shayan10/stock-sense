import { Request, Response, Router } from "express";
import { holdingRepo } from "../services/holdings/HoldingRepo";

const router = Router();

router.get("/:account_id", async (req: Request, res: Response) => {
	const { account_id } = req.params;
	const { user_id } = req.body;

	if (!user_id) {
		res.status(401).send({ message: "Forbidden" });
	}

	try {
		// Fetch the holdings for the account
		const results = await holdingRepo.get(
			parseInt(user_id),
			parseInt(account_id)
		);
		res.status(200).send(results);
	} catch (error) {
		console.log(error);
		res.status(400).send({ message: "Could not retrieve holdings" });
	}
});

export default router;
