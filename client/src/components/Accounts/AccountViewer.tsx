import { QuoteContext } from "../../context/QuoteContext";
import { AccountItem } from "../AccountItem";
import AccountRow from "./AccountRow";
import { AccountProps } from "./types/AccountProps";
import { useContext, useEffect, useState } from "react";

const AccountViewer = ({
	account_name,
	holdings,
}: AccountProps) => {
	const [profit, setProfit] = useState(0);
	const [change, setChange] = useState(0);
	const [accountValue, setAccountValue] = useState(0);

	const { quotes } = useContext(QuoteContext);

	const addChange = (num: number) => setChange(change + num);
	const addProfit = (num: number) => setProfit(profit + num);
	const addToTotal = (num: number) => setAccountValue(accountValue + num);

	
	useEffect(() => {
		// Calculate initial values based on holdings and quotes
		let newProfit = 0;
		let newChange = 0;
		let newAccountValue = 0;
		holdings.forEach((holding) => {
		    const priceData = quotes && quotes[holding.ticker_symbol];
		    if (priceData) {
			   newChange += (priceData.current_price - priceData.previous_close) * holding.quantity;
			   newProfit += (priceData.current_price - holding.cost_basis) * holding.quantity;
			   newAccountValue += priceData.current_price * holding.quantity;
		    }
		});
  
		setChange(newChange);
		setProfit(newProfit);
		setAccountValue(newAccountValue);
	 }, [quotes]);

	return (
		<div className="mb-5">
			<h5>{account_name}</h5>
			<table className="table table-striped table-hover">
				<thead>
					<tr>
						<th scope="col">Ticker Symbol</th>
						<th scope="col">Qty.</th>
						<th scope="col">Cost Basis</th>
						<th scope="col">Current Price </th>
						<th scope="col">Today's Change (%)</th>
						<th scope="col">Today's Change ($)</th>
						<th scope="col">Profit/Loss (%)</th>
						<th scope="col">Profit/Loss ($)</th>
					</tr>
				</thead>
				<tbody>
					{(holdings || []).map((holding) => (
						<AccountRow
							key={holding.id}
							holding={holding}
							priceData={
								quotes && quotes[holding.ticker_symbol]
							}
							addChange={addChange}
							addTotalProfit={addProfit}
							addToTotal={addToTotal}
						/>
					))}
				</tbody>
			</table>
			<div className="d-flex justify-content-between">
				<div className="account-info">
					<p className="fw-bold">Account Value: $</p>
					<span className="fw-bold text-secondary">{accountValue.toFixed(2)}</span>
					<p className="fw-bold mx-2">Today's P/L: $</p>
					<AccountItem num={change} />
					<p className="fw-bold mx-2">Total P/L: $</p>
					<AccountItem num={profit} />
				</div>
			</div>
			<hr />
		</div>
	);
};

export default AccountViewer;
