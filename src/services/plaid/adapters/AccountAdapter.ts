import { AccountBase } from "plaid";
import { AccountPayload } from "../../accounts/AccountSchema";
import { AccountRepo } from "../../accounts/AccountRepo";

interface IAccountRepo {
	insert(
		user_id: number,
		data: AccountPayload[]
	): Promise<
		{
			id: number;
			plaid_account_id: string;
		}[]
	>;
}

export type AccountMap = Map<string, number>;

class AccountAdapter {
	constructor(private accountRepo: IAccountRepo) {}

	private parseAccountData(data: AccountBase[]): AccountPayload[] {
		const accounts: AccountPayload[] = [];

		data.forEach((account: AccountBase) => {
			if (account.account_id && account.name) {
				accounts.push({
					plaid_account_id: account.account_id,
					account_name: account.name,
				});
			}
		});

		return accounts;
	}

	// private transformData(
	// 	data: { id: number; plaid_account_id: string }[]
	// ): AccountMap {
	// 	const map: AccountMap = new Map<string, number>();
	// 	data.forEach((obj) => {
	// 		console.log("Obj id" + obj.plaid_account_id);
	// 		console.log("Obj ID: " + obj.id);
	// 		map.set(obj.plaid_account_id, obj.id);
	// 		console.log("Map value:" + map.get(obj.plaid_account_id));
	// 	});
	// 	return map;
	// }

	async saveAccounts(
		user_id: string,
		data: AccountBase[]
	): Promise<AccountMap> {
		const parsedAccounts: AccountPayload[] = this.parseAccountData(data);
		const result = await this.accountRepo.insert(
			parseInt(user_id),
			parsedAccounts
		);

		const map: AccountMap = new Map<string, number>();
		result.forEach((obj) => {
			map.set(obj.plaid_account_id, obj.id);
		});

		return map;
	}
}

export default new AccountAdapter(new AccountRepo());
