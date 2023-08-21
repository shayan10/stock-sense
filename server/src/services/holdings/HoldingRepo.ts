import { sql } from "kysely";
import { db } from "../../db/Postgres";
import { HoldingPayload } from "./HoldingSchema";

export interface HoldingPublicResponse {
	id: number;
	cost_basis: number;
	quantity: number;
	ticker_symbol: string;
}

export interface HoldingInfo {
	ticker_symbols: string[];
	total_cost: number;
}

export interface PositionInfo {
	ticker_symbol: string;
	position_size: number;
	positon_cost: number;
}

export interface PaginationOptions {
	limit?: number;
	offset?: number;
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

	async getMany(
		user_id: number,
		account_id: number,
		paginationOptions: PaginationOptions = {
			limit: 5,
			offset: 0,
		}
	): Promise<HoldingPublicResponse[]> {
		const { limit = 5, offset = 0 } = paginationOptions;

		const result = await db
			.selectFrom("holdings")
			.select(["id", "ticker_symbol", "cost_basis", "quantity"])
			.where("user_id", "=", user_id)
			.where("account_id", "=", account_id)
			.limit(limit)
			.offset(offset)
			.execute();
		return result;
	}

	async get(
		user_id: number,
		holding_id: number
	): Promise<HoldingPublicResponse | undefined> {
		const result = await db
			.selectFrom("holdings")
			.where("user_id", "=", user_id)
			.where("id", "=", holding_id)
			.select(["id", "cost_basis", "ticker_symbol", "quantity"])
			.executeTakeFirst();
		return result;
	}

	async getPositions(user_id: number): Promise<PositionInfo[]> {
		const query = sql<PositionInfo>`SELECT ticker_symbol, SUM(quantity) as position_size, SUM(quantity*cost_basis) AS position_cost FROM holdings WHERE user_id=${user_id} GROUP BY ticker_symbol;`;
		const result = await query.execute(db);
		return result.rows;
	}
}

export const holdingRepo = new HoldingRepo();
