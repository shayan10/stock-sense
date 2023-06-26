import { Holding, Security } from "plaid";
import { HoldingPayload } from "../../holdings/HoldingSchema";
import { AccountMap } from "./AccountAdapter";
import { HoldingRepo } from "../../holdings/HoldingRepo";

interface IHoldingRepo {
	insert(
		user_id: number,
		data: HoldingPayload[]
	): Promise<
		{
			account_id: number;
			ticker_symbol: string;
			quantity: string;
			cost_basis: string;
		}[]
	>;
}

type SecurityMap = Map<string, string>;

class HoldingAdapter {
	constructor(private holdingRepo: IHoldingRepo) {}

	private isValidSecurityType(type: string): boolean {
		return [
			"cash",
			"etf",
			"equity",
			"mutual fund",
			"fixed income",
			"cryptocurrency",
		].includes(type);
	}

	private parseSecurities(securities: Security[]): SecurityMap {
		const map: SecurityMap = new Map();
		securities.forEach((security: Security) => {
			if (
				security.ticker_symbol &&
				security.type &&
				this.isValidSecurityType(security.type)
			) {
				// Skip cash and crypto currencies
				if (
					security.type == "cash" ||
					security.ticker_symbol.includes("CUR:") ||
					security.type == "cryptocurrency" ||
					security.ticker_symbol ==
						security.institution_security_id
				) {
					return;
				}

				map.set(security.security_id, security.ticker_symbol);
			}
		});
		return map;
	}

	private parseHoldings(
		data: Holding[],
		securityMap: SecurityMap,
		accountMap: AccountMap
	): HoldingPayload[] {
		const holdings: HoldingPayload[] = [];
		data.forEach((holding: Holding) => {
			const account_id = accountMap.get(holding.account_id);
			const ticker_symbol = securityMap.get(holding.security_id);
			const { quantity, cost_basis } = holding;

			if (account_id && ticker_symbol && quantity && cost_basis) {
				holdings.push({
					account_id,
					ticker_symbol,
					cost_basis,
					quantity,
				});
			}
		});
		return holdings;
	}

	async saveHoldings(
		user_id: string,
		holdings: Holding[],
		securities: Security[],
		accountMap: AccountMap
	) {
		const securityMap = this.parseSecurities(securities);

		const parsedHoldings = this.parseHoldings(
			holdings,
			securityMap,
			accountMap
		);

		if (parsedHoldings.length == 0) {
			return [];
		}

		const result = await this.holdingRepo.insert(
			parseInt(user_id),
			parsedHoldings
		);
		return result;
	}
}

export default new HoldingAdapter(new HoldingRepo());
