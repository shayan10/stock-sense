import {
	CountryCode,
	PlaidApi,
	LinkTokenCreateRequest,
	Products,
	InvestmentAccountSubtype,
	SandboxPublicTokenCreateRequest,
	ItemPublicTokenExchangeRequest,
	InvestmentsHoldingsGetRequest,
	AccountBase,
	Holding,
	Security,
} from "plaid";

import { db } from "../../db/Postgres";

import initializePlaidClient from "./plaidClient";

class PlaidService {
	constructor(private plaidAPI: PlaidApi) {}

	async generateLinkToken(
		user_id: string,
		access_token?: string
	): Promise<String> {
		try {
			const request: LinkTokenCreateRequest = {
				user: {
					client_user_id: user_id,
				},
				client_name: "Stock Sense",
				products: [Products.Investments],
				country_codes: [CountryCode.Us],
				language: "en",
				account_filters: {
					investment: {
						account_subtypes: [InvestmentAccountSubtype.All],
					},
				},
			};

			if (access_token) {
				request["access_token"] = access_token;
			}

			const response = await this.plaidAPI.linkTokenCreate(request);
			if (response.status != 200) {
				throw new Error("Failed to generated link");
			}

			return response.data.link_token;
		} catch (error) {
			throw error;
		}
	}

	async generatePublicToken(): Promise<String> {
		try {
			const publicTokenRequest: SandboxPublicTokenCreateRequest = {
				institution_id: "ins_109512",
				initial_products: [Products.Investments],
			};

			const publicTokenResponse =
				await this.plaidAPI.sandboxPublicTokenCreate(
					publicTokenRequest
				);
			const publicToken = publicTokenResponse.data.public_token;
			return publicToken;
		} catch (error) {
			// handle error
			throw error;
		}
	}

	async generateAccessToken(publicToken: string): Promise<string> {
		try {
			const exchangeRequest: ItemPublicTokenExchangeRequest = {
				public_token: publicToken,
			};
			const exchangeTokenResponse =
				await this.plaidAPI.itemPublicTokenExchange(
					exchangeRequest
				);
			const accessToken = exchangeTokenResponse.data.access_token;

			return accessToken;
		} catch (error) {
			throw error;
		}
	}

	async saveAccessToken(user_id: number, accessToken: string) {
		await db
			.insertInto("plaid_tokens")
			.values({
				user_id,
				access_token: accessToken,
			})
			.execute();
	}

	async getInvestments(accessToken: string): Promise<{
		accounts: AccountBase[];
		holdings: Holding[];
		securities: Security[];
	}> {
		try {
			const request: InvestmentsHoldingsGetRequest = {
				access_token: accessToken,
			};

			const response = await this.plaidAPI.investmentsHoldingsGet(
				request
			);
			const holdings = response.data.holdings;
			const accounts = response.data.accounts;
			const securities = response.data.securities;

			return {
				accounts,
				holdings,
				securities,
			};
		} catch (error) {
			throw error;
		}
	}
}

const plaidClient = initializePlaidClient();
const plaidService = new PlaidService(plaidClient);
export default plaidService;
