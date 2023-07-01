import { db } from "../../db/Postgres";
import { AccountPayload } from "./AccountSchema";
import { jsonArrayFrom } from "kysely/helpers/postgres";

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

	async get(user_id: number) {
		const results = await db
			.selectFrom("accounts")
			.select(["id", "account_name"])
			.select((eb) => {
				return jsonArrayFrom(
					eb
						.selectFrom("holdings")
						.selectAll("holdings")
						.whereRef(
							"holdings.account_id",
							"=",
							"accounts.id"
						)
						.orderBy("holdings.cost_basis")
						.limit(5)
				).as("holdings");
			})
			.where("accounts.user_id", "=", user_id)
			.execute();
		return results;
	}
}
