import { Quote, Position, PriceData } from "../context/QuoteContext";
import { AxiosInstance } from "axios";

export const fetchQuotes = async (axios: AxiosInstance) => {
	const quotes = await axios.get("/holdings/positions");
	return quotes.data as {
		quotes: Quote;
		positions: Position[];
	};
};

export const getTotalChange = (
	quotes: Quote,
	positions: Position[]
): number => {
	let newTotal = 0;
	let costBasis = 0;
	let quote: PriceData;
	positions.forEach((position) => {
		quote = quotes[position.ticker_symbol];
		newTotal += quote.current_price * position.position_size;
		costBasis += position.position_cost * position.position_size;
	});
	return parseInt((((newTotal - costBasis) / costBasis) * 100).toFixed(2));
};

export const getCurrentChange = (
	quotes: Quote,
	positions: Position[]
): number => {
	let newTotal = 0;
	let costBasis = 0;
	let quote: PriceData;
	positions.forEach((position) => {
		quote = quotes[position.ticker_symbol];
		newTotal += quote.current_price * position.position_size;
		costBasis += quote.previous_close * position.position_size;
	});
	return parseInt((((newTotal - costBasis) / costBasis) * 100).toFixed(2));
};
