import { createContext, useState, useEffect } from "react";
import { fetchQuotes } from "../services/Quotes";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

export type Position = {
	ticker_symbol: string,
	position_size: number,
	position_cost: number
}

export type PriceData = {
	current_price: number,
	previous_close: number,
	timestamp: string
}

export type Quote = {[key: string]: PriceData}

interface QuoteContextValues {
	quotes: Quote;
	positions: Position[];
	errorMsg: string;
	refresh: () => void;
   }   

const defaultContextValues = {
	quotes: {},
	positions: [],
	refresh: () => {},
	errorMsg: ''
}

export const QuoteContext = createContext<QuoteContextValues>(defaultContextValues);

export const QuoteProvider = ({children}: any) => {
	const [quotes, setQuotes] = useState<Quote>({});
	const [positions, setPositions] = useState<Position[]>([]);
	const [errorMsg, setErrorMsg] = useState('');
	const axios = useAxiosPrivate();

	const fetchData = () => {
		const response = fetchQuotes(axios);
		response.then((data) => {
			console.log(data);
			setQuotes(data.quotes);
			setPositions(data.positions);
		}).catch((error) => {
			setErrorMsg("Cannot fetch quotes");
		});
	}

	useEffect(() => {
		fetchData();
		console.log("fetching data");
	}, []);
	
	const refresh = () => {
		fetchData();
	};

	return (
		<QuoteContext.Provider value={{quotes, positions, refresh, errorMsg}}>
			{children}
		</QuoteContext.Provider>
	)
}