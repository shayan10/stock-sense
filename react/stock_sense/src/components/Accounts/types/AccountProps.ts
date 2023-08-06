import { PriceData, Quote } from "../../../context/QuoteContext";

export interface Holding {
	id: number;
	account_id: number;
	ticker_symbol: string;
	quantity: number;
	cost_basis: number;
}

export interface AccountProps {
	id: number;
	name: string;
	total_holdings: number;
	holdings: Holding[];
	quotes: Quote;
}

export interface AccountRowProps {
	holding: Holding;
	priceData: PriceData;
	addChange: (num: number) => void;
	addTotalProfit: (num: number) => void;
}
