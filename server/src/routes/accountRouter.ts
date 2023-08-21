import { NextFunction, Request, Response, Router } from "express";
import { accountRepo } from "../services/accounts/AccountRepo";
import { holdingService } from "../services/holdings/HoldingService";
import { query, param, validationResult } from "express-validator";
import { PaginationOptions } from "../services/holdings/HoldingRepo";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { user_id } = req.body;

		// Fetch the user accounts
		const results = await accountRepo.get(parseInt(user_id));
		res.status(200).send(results);
	} catch (error) {
		next(error);
	}
});

router.get(
	"/:account_id",
	[
		param("account_id")
			.isNumeric()
			.withMessage("Account ID must be an integer"),
	],
	[
		query("offset")
			.optional()
			.isNumeric()
			.withMessage("Offset must be an integer"),
	],
	[
		query("limit")
			.if(query("offset").exists())
			.isNumeric()
			.withMessage("Limit must be an integer"),
	],
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatorResult = validationResult(req);

			if (!validatorResult.isEmpty()) {
				res.status(400).send(validatorResult.array());
				return;
			}

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

			// Fetch the holdings for the account
			const results = await holdingService.retrieveAccountHoldings(
				parseInt(user_id),
				parseInt(account_id),
				paginationOptions
			);
			res.status(200).send(results);
		} catch (error) {
			next(error);
		}
	}
);

export default router;
