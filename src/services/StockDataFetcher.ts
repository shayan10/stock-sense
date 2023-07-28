import axios from "axios";
import yahooFinance from "yahoo-finance2";
import { DateTime } from "luxon";
import _ from "lodash";

import { redisClient } from "../db/Redis";

interface RawQuote {
	c: number;
	h: number;
	l: number;
	o: number;
	pc: number;
	t: number;
}

export interface Quote {
	current_price: number;
	previous_close: number;
	timestamp: Date;
}

export interface News {
	category: string;
	datetime: number;
	headline: string;
	id: number;
	image: string;
	related: string;
	source: string;
	summary: string;
	url: string;
}

export interface HistoricalQuote {
	timestamp: Date;
	low: number;
	high: number;
	close: number;
}

class StockDataFetcher {
	constructor(private API_KEY: string, private URL: string) {}

	async getQuote(ticker_symbol: string): Promise<Quote> {
		const cachedResult: string | null = await redisClient.get(
			`${ticker_symbol}-quote`
		);
		if (cachedResult) {
			const quote: Quote = JSON.parse(cachedResult) as Quote;
			return quote;
		}
		console.log(`${this.URL}/quote?symbol=${ticker_symbol}`);
		const response = await axios.get(
			`${this.URL}/quote?symbol=${ticker_symbol}`,
			{
				headers: {
					"X-Finnhub-Token": this.API_KEY,
				},
			}
		);

		if (response.status != 200) {
			throw Error("Cannot retrieve price information");
		}

		const data = response.data as RawQuote;
		const result: Quote = {
			current_price: data.c,
			previous_close: data.pc,
			timestamp: DateTime.fromSeconds(data.t).toJSDate(),
		};

		await redisClient.set(
			`${ticker_symbol}-quote`,
			JSON.stringify(result),
			"EXAT",
			DateTime.now().plus({ minutes: 2 }).toUnixInteger()
		);

		return result;
	}

	async getNews(ticker_symbol: string): Promise<News[]> {
		const cachedResult: string | null = await redisClient.get(
			`${ticker_symbol}-news`
		);
		if (cachedResult) {
			const news = JSON.parse(cachedResult) as News[];
			return news;
		}
		const currentDate = DateTime.now();
		const startDate = currentDate
			.minus({ days: 7 })
			.toFormat("yyyy-MM-dd");
		const endDate = currentDate.toFormat("yyyy-MM-dd");

		const response = await axios.get(
			`${this.URL}/company-news?symbol=${ticker_symbol}&from=${startDate}&to=${endDate}`,
			{
				headers: {
					"X-Finnhub-Token": this.API_KEY,
				},
			}
		);

		if (response.status != 200) {
			throw new Error("Cannot retrieve company news");
		}

		let data = response.data as News[];
		if (data.length > 10) {
			data = _.sampleSize(data, 10);
		}

		await redisClient.set(
			`${ticker_symbol}-news`,
			JSON.stringify(data),
			"EXAT",
			DateTime.now().plus({ hours: 12 }).toUnixInteger()
		);
		return data;
	}

	async getQuoteList(
		ticker_symbols: string[]
	): Promise<{ [key: string]: Quote }> {
		try {
			// Create an array of fetch promises for each ticker symbol
			const fetchPromises = ticker_symbols.map((symbol) =>
				this.getQuote(symbol)
			);

			// Use Promise.all() to fetch data for all the ticker symbols concurrently
			const quotes = await Promise.all(fetchPromises);

			// Now, consolidate the results into { company: data } format
			const result: { [key: string]: Quote } = {};

			ticker_symbols.forEach((symbol, index) => {
				result[symbol] = quotes[index];
			});

			// Print or return the final result in the desired format
			return result;
			// return result;
		} catch (error) {
			console.log(error);
			throw new Error("Cannot fetch quote");
		}
	}

	async getHistoricalPrices(
		ticker_symbol: string
	): Promise<HistoricalQuote[]> {
		const cachedResult: string | null = await redisClient.get(
			`${ticker_symbol}-historical-prices`
		);
		if (cachedResult) {
			const historicalPrices = JSON.parse(
				cachedResult
			) as HistoricalQuote[];
			return historicalPrices;
		}
		const endDate = DateTime.now();
		const startDate = endDate.minus({ days: 31 });
		const data = await yahooFinance.historical(ticker_symbol, {
			period1: startDate.toFormat("yyyy-MM-dd"),
			period2: endDate.toFormat("yyyy-MM-dd"),
		});
		const result = data.map(
			(historicalData): HistoricalQuote => ({
				timestamp: historicalData.date,
				low: historicalData.low,
				high: historicalData.high,
				close: historicalData.close,
			})
		);

		await redisClient.set(
			`${ticker_symbol}-historical-prices`,
			JSON.stringify(result),
			"EXAT",
			DateTime.now().plus({ hours: 12 }).toUnixInteger()
		);
		return result;
	}
}

const { FINNHUB_API_KEY } = process.env;
const FINNHUB_URL = "https://finnhub.io/api/v1";
if (!FINNHUB_API_KEY) {
	throw new Error("Finnhub API Key is not defined");
}

export const stockDataFetcher = new StockDataFetcher(
	FINNHUB_API_KEY,
	FINNHUB_URL
);
