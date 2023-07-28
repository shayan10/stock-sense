import { Request, Response, Router } from "express";
import { accountRepo } from "../services/accounts/AccountRepo";
import { holdingService } from "../services/holdings/HoldingService";
import { query, param } from "express-validator";
import { PaginationOptions } from "../services/holdings/HoldingRepo";

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

router.get(
	"/:account_id",
	[
		param("account_id")
			.isNumeric()
			.withMessage("Account ID must be an interger"),
		query("limit").isNumeric().withMessage("Limit must be an integer"),
		query("offset").isNumeric().withMessage("Offset must be an integer"),
	],
	async (req: Request, res: Response) => {
		const { account_id } = req.params;
		const { user_id } = req.body;

		const { limit, offset } = req.query as {
			limit: string;
			offset: string;
		};

		const paginationOptions: PaginationOptions = {};
		if (limit) {
			paginationOptions["limit"] = parseInt(limit);
		}
		if (offset) {
			paginationOptions["offset"] = parseInt(offset);
		}

		try {
			// Fetch the holdings for the account
			const results = await holdingService.retrieveAccountHoldings(
				parseInt(user_id),
				parseInt(account_id),
				paginationOptions
			);
			res.status(200).send(results);
		} catch (error) {
			console.log(error);
			res.status(400).send({ message: "Could not retrieve holdings" });
		}
	}
);

export default router;
