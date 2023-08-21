import { createContext, useState, useEffect } from "react";
import { fetchQuotes } from "../services/Quotes";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

export type Position = {
	ticker_symbol: string,
	position_size: number,
	position_cost: number
}

export type PriceData = {
	open: number;
	current_price: number,
	previous_close: number,
	current_percent_change: number,
	timestamp: string;
	low: number;
	high: number;
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
	const navigate = useNavigate();

	const fetchData = () => {
		const response = fetchQuotes(axios);
		response.then((data) => {
			console.log(data);
			setQuotes(data.quotes);
			setPositions(data.positions);
		}).catch((error) => {
			setErrorMsg("Cannot fetch quotes");
			navigate("/login")		
		});
	}

	useEffect(() => {
		fetchData();
		console.log("fetching data");
	}, []);
	
	const refresh = () => {
		console.log("refreshing");
		fetchData();
	};

	return (
		<QuoteContext.Provider value={{quotes, positions, refresh, errorMsg}}>
			{children}
		</QuoteContext.Provider>
	)
}