import { AccountBase } from "plaid";
import { AccountPayload } from "./AccountSchema";
import { AccountRepo } from "./AccountRepo";

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

class AccountService {
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
		// TODO: Insert accounts using account repo
		const result = await this.accountRepo.insert(
			parseInt(user_id),
			parsedAccounts
		);
		return this.transformData(result);
	}
}

export default new AccountService(new AccountRepo());
