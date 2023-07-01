import { db } from "../../db/Postgres";
import { HoldingPayload } from "./HoldingSchema";

interface HoldingPublicResponse {
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
		const results = await db
			.selectFrom("holdings")
			.select([
				"id",
				"user_id",
				"account_id",
				"cost_basis",
				"quantity",
				"ticker_symbol",
			])
			.where("account_id", "=", account_id)
			.where("user_id", "=", user_id)
			.execute();

		return results;
	}
}
