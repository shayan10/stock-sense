import { BaseError } from "../../errors/customError";
import {
	stockDataFetcher,
	Quote,
	News,
	HistoricalQuote,
	Metric,
} from "./../StockDataFetcher";
import {
	HoldingPublicResponse,
	holdingRepo,
	PositionInfo,
	PaginationOptions,
} from "./HoldingRepo";
import { HoldingPayload } from "./HoldingSchema";

export type PositionDetail = {
	historicalPrices: HistoricalQuote[];
	id: number;
	cost_basis: number;
	quantity: number;
	ticker_symbol: string;
	metrics: Metric;
	quote: Quote;
};

export type PositionList = {
	positions: PositionInfo[];
	quotes: { [key: string]: Quote };
};

class HoldingService {
	async insertHolding(user_id: number, payload: HoldingPayload[]) {
		const result = await holdingRepo.insert(user_id, payload);
		return result;
	}

	async retrieveAccountHoldings(
		user_id: number,
		account_id: number,
		paginationOptions?: PaginationOptions
	): Promise<HoldingPublicResponse[]> {
		return await holdingRepo.getMany(
			user_id,
			account_id,
			paginationOptions
		);
	}

	async retrievePositions(user_id: number): Promise<PositionList> {
		const positions: PositionInfo[] = await holdingRepo.getPositions(
			user_id
		);
		const symbols: string[] = positions.map(
			(position) => position.ticker_symbol
		);
		const quotes = await stockDataFetcher.getQuoteList(symbols);
		return {
			positions,
			quotes,
		};
	}

	async positionDetail(
		user_id: number,
		holding_id: number
	): Promise<PositionDetail> {
		const holding = await holdingRepo.get(user_id, holding_id);
		if (!holding) {
			throw new BaseError(
				"Holding not found",
				"not_found",
				"No holding was found with the given id",
				404
			);
		}
		const historicalPrices: HistoricalQuote[] =
			await stockDataFetcher.getStockCandles(holding.ticker_symbol);
		const metrics = await stockDataFetcher.getMetrics(
			holding.ticker_symbol
		);
		const quote = await stockDataFetcher.getQuote(holding.ticker_symbol);
		return {
			...holding,
			quote,
			metrics,
			historicalPrices,
		};
	}

	async positionNews(ticker_symbol: string): Promise<News[]> {
		return stockDataFetcher.getNews(ticker_symbol);
	}
}

export const holdingService = new HoldingService();
