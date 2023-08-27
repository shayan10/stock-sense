import { sql } from "kysely";
import { db } from "../../db/Postgres";
import { AccountPayload } from "./AccountSchema";
import { AccountPublicResponse } from "./AccountSchema";

export class AccountRepo {
	async insert(user_id: number, data: AccountPayload[]) {
		const accounts = data.map((account: AccountPayload) => {
			return {
				...account,
				user_id,
			};
		});

		const results = await db
			.insertInto("accounts")
			.values(accounts)
			.returning(["id", "accounts.plaid_account_id"])
			.execute();
		return results;
	}

	async get(user_id: number): Promise<AccountPublicResponse[]> {
		const query = sql<AccountPublicResponse>`SELECT
			accounts.id,
			accounts.account_name,
			JSON_AGG(JSON_BUILD_OBJECT(
				'id', holdings.id,
				'account_id', holdings.account_id,
				'ticker_symbol', holdings.ticker_symbol,
				'quantity', holdings.quantity,
				'cost_basis', holdings.cost_basis 
			)) AS holdings
			FROM accounts
			INNER JOIN holdings ON holdings.account_id = accounts.id
			WHERE accounts.user_id = ${user_id}
			GROUP BY accounts.id, accounts.account_name;
		 `;
		const results = await query.execute(db);
		return results.rows;
	}
}

export const accountRepo = new AccountRepo();
