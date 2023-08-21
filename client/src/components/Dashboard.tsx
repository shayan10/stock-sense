import { useEffect, useState } from "react";
import { QuoteProvider } from "../context/QuoteContext";
import HoldingsViewer from "./HoldingsViewer";
import Performance from "./Performance";
import SearchBar from "./SearchBar";
import { AccountProps } from "./Accounts/types/AccountProps";
import { fetchAccounts } from "../services/Accounts";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
	const [accounts, setAccounts] =  useState<AccountProps[]>([]);
	const navigate = useNavigate();
	const axios = useAxiosPrivate();

	useEffect(() => {
		fetchAccounts(axios).then((accounts) => setAccounts(accounts)).catch((error) => navigate("/login"));
	}, []);

	return (
		<div className="container">
			<QuoteProvider>
				<Performance />
				<HoldingsViewer accounts={accounts}/>
			</QuoteProvider>
		</div>
	);
};

export default Dashboard;
