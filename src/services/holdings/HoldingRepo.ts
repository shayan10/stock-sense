import { db } from "../../db/Postgres";
import { HoldingPayload } from "./HoldingSchema";

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
}
