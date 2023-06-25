import { db } from "../../db/Postgres";
import { AccountPayload } from "./AccountSchema";

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
}
