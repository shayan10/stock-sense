import { Request, Response, Router } from "express";
import plaidService from "../services/plaid/PlaidService";
import accountAdapter from "../services/plaid/adapters/AccountAdapter";
import holdingAdapter from "../services/plaid/adapters/HoldingsAdapter";
import { db } from "../db/Postgres";
import { BaseError } from "../errors/customError";

const router = Router();

router.get("/link-token", async (req: Request, res: Response) => {
	try {
		const { user_id } = req.body;
		const linkToken = await plaidService.generateLinkToken(user_id);
		res.status(200).send({ linkToken });
	} catch (error) {
		console.log(error);
		res.status(400).send({
			message: "Unable to get link token",
		});
	}
});

router.get("/public-token", async (req: Request, res: Response) => {
	try {
		const publicToken = await plaidService.generatePublicToken();
		res.status(200).send({ publicToken });
	} catch (error) {
		console.log(error);
		res.status(400).send({
			message: "Unable to get public token",
		});
	}
});

router.get("/initialize", async (req: Request, res: Response) => {
	try {
		const user_id = req.body.user_id as string;

		if (!user_id) {
			res.status(401).send();
		}

		const result = await db
			.selectFrom("plaid_tokens")
			.where("user_id", "=", parseInt(user_id))
			.select("access_token")
			.executeTakeFirstOrThrow();

		const investments = await plaidService.getInvestments(
			result.access_token
		);

		const accountMap = await accountAdapter.saveAccounts(
			user_id.toString(),
			investments.accounts
		);
		const holdings = await holdingAdapter.saveHoldings(
			user_id,
			investments.holdings,
			investments.securities,
			accountMap
		);

		res.status(201).send({ holdings });
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
});

router.post("/access-token", async (req: Request, res: Response) => {
	try {
		const { public_token, user_id } = req.body;

		if (!public_token && typeof public_token != "string") {
			throw new BaseError(
				"No public token provided",
				"invalid_plaid_public_token",
				"No public token was received in the request",
				400
			);
		}

		const accessToken = await plaidService.generateAccessToken(
			public_token
		);

		if (!user_id) {
			res.status(401);
		}

		await plaidService.saveAccessToken(user_id, accessToken);
		res.status(201).send();
	} catch (error) {
		console.log(error);
		res.status(400).send({
			message: "Unable to get access token",
		});
	}
});

export default router;
