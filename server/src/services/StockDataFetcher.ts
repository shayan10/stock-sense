import axios from "axios";
import yahooFinance from "yahoo-finance2";
import { DateTime, IANAZone  } from "luxon";
import _ from "lodash";

import { redisClient } from "../db/Redis";

interface RawQuote {
	c: number;
	h: number;
	dp: number;
	l: number;
	o: number;
	pc: number;
	t: number;
}

export interface Quote {
	current_price: number;
	previous_close: number;
	current_percent_change: number;
	timestamp: Date;
	open: number;
	low: number;
	high: number;
}

export interface Metric {
	low: number;
	high: number;
	low_per_change: number;
	high_per_change: number;
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
	open: number;
}

export interface RawCandle {
	c: number[];
	o: number[];
	v: number[];
	l: number[];
	h: number[];
	t: number[];
	s: string;
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
			current_percent_change: data.dp,
			timestamp: DateTime.fromSeconds(data.t).toJSDate(),
			open: data.o,
			low: data.l,
			high: data.h,
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

	private processCandles(data: RawCandle): HistoricalQuote[] {
		let result: HistoricalQuote[] = [];
		for (let i = 0; i < data.c.length; i++) {
			const timestamp = DateTime.fromSeconds(data.t[i]);
			result.push({
				open: data.o[i],
				close: data.c[i],
				low: data.l[i],
				high: data.h[i],
				timestamp: timestamp.toJSDate(),
			});
		}
		return result;
	}

	async getStockCandles(ticker_symbol: string): Promise<HistoricalQuote[]> {
		try {
			const estZone = IANAZone.create("America/New_York");
			const now = DateTime.now().setZone(estZone); // Set timezone to EST

			let endDate = now;
			let startDate = endDate;

			if (now.weekday === 6) {
				// Saturday: Data from 7 AM EST on Wednesday to 6 PM EST on Friday
				startDate = now.minus({ days: 3 }).set({
					hour: 7,
					minute: 0,
					second: 0,
					millisecond: 0,
				});
				endDate = now.minus({ days: 1 }).set({
					hour: 18,
					minute: 0,
					second: 0,
					millisecond: 0,
				});
			} else if (now.weekday === 7) {
				// Sunday: Data from 7 AM EST on Wednesday to 6 PM EST on Friday
				startDate = now.minus({ days: 4 }).set({
					hour: 7,
					minute: 0,
					second: 0,
					millisecond: 0,
				});
				endDate = now.minus({ days: 2 }).set({
					hour: 18,
					minute: 0,
					second: 0,
					millisecond: 0,
				});
			} else {
				// Weekday: Data from 7 AM EST of the day before to the current time
				startDate = now.minus({ days: 2 }).set({
					hour: 7,
					minute: 0,
					second: 0,
					millisecond: 0,
				});
			};

			const response = await axios.get(
				`https://finnhub.io/api/v1/stock/candle?symbol=${ticker_symbol}&resolution=5&from=${startDate.toUnixInteger()}&to=${endDate.toUnixInteger()}`,
				{
					headers: {
						"X-Finnhub-Token": this.API_KEY,
					},
				}
			);

			const data = response.data as RawCandle;

			if (data.s != "ok") {
				return [];
			}

			let candles: HistoricalQuote[] = this.processCandles(data);

			return candles;
		} catch (error) {
			return [];
		}
	}

	async getMetrics(ticker_symbol: string): Promise<Metric> {
		const cachedResult: string | null = await redisClient.get(
			`${ticker_symbol}-metrics`
		);
		if (cachedResult) {
			const metrics = JSON.parse(cachedResult);
			return metrics;
		}
		const data = await yahooFinance.quote(ticker_symbol);
		const result = {
			low: data.fiftyTwoWeekLow || 0,
			high: data.fiftyTwoWeekHigh || 0,
			low_per_change: data.fiftyTwoWeekLowChange || 0,
			high_per_change: data.fiftyTwoWeekHighChange || 0,
		};

		await redisClient.set(
			`${ticker_symbol}-metrics`,
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
