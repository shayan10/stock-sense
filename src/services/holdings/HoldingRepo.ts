import { db } from "../../db/Postgres";
import { HoldingPayload } from "./HoldingSchema";

export interface HoldingPublicResponse {
	id: number;
	user_id: number;
	account_id: number;
	cost_basis: number;
	quantity: number;
	ticker_symbol: string;
}

export class HoldingRepo {
	async insert(user_id: number, data: HoldingPayload[]) {
		const holdings = data.map((holding: HoldingPayload) => {
			return {
				...holding,
				user_id,
			};
		});

		const results = await db
			.insertInto("holdings")
			.values(holdings)
			.returning([
				"id",
				"account_id",
				"quantity",
				"ticker_symbol",
				"cost_basis",
			])
			.execute();

		return results;
	}

	async get(
		user_id: number,
		account_id: number
	): Promise<HoldingPublicResponse[]> {
		const result = await db
			.selectFrom("accounts")
			.where("accounts.user_id", "=", user_id)
			.where("accounts.id", "=", account_id)
			.innerJoin("holdings as h", "account_id", "h.account_id")
			.select([
				"h.id",
				"h.account_id",
				"h.cost_basis",
				"h.ticker_symbol",
				"h.quantity",
				"h.cost_basis",
				"h.user_id",
			])
			.execute();
		return result;
	}
}

export const holdingRepo = new HoldingRepo();
