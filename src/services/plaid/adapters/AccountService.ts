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

type AccountMap = Map<string, number>;

class AccountAdapter {
	constructor(private accountRepo: IAccountRepo) {}

	private parseAccountData(data: AccountBase[]): AccountPayload[] {
		const accounts: AccountPayload[] = [];

		data.forEach((account: AccountBase) => {
			if (account.account_id && account.official_name) {
				accounts.push({
					plaid_account_id: account.account_id,
					account_name: account.official_name,
				});
			}
		});

		return accounts;
	}

	private transformData(
		data: { id: number; plaid_account_id: string }[]
	): AccountMap {
		const map = new Map();
		data.forEach((obj) => {
			map.set(obj.plaid_account_id, obj.id);
		});
		return map;
	}

	async saveAccounts(user_id: string, data: AccountBase[]) {
		const parsedAccounts: AccountPayload[] = this.parseAccountData(data);
		const result = await this.accountRepo.insert(
			parseInt(user_id),
			parsedAccounts
		);
		return this.transformData(result);
	}
}

export default new AccountAdapter(new AccountRepo());
