import { PriceData } from "../../../context/QuoteContext";

export interface Metrics {
	low: number;
	high: number;
	low_per_change: number;
	high_per_change: number;
}

export interface HistoricalPrice {
	timestamp: Date;
	low: number;
	high: number;
	close: number;
	open: number;
}

export interface News {
	headline: string;
	image: string;
	url: string;
	summary: string;
}

export interface HoldingProps {
	id: number;
	cost_basis: number;
	ticker_symbol: string;
	quantity: number;
	metrics: Metrics;
	historicalPrices: HistoricalPrice[];
	quote: PriceData;
	news: News[];
}
