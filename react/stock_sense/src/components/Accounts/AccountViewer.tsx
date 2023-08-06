import { AccountItem } from "./AccountItem";
import AccountRow from "./AccountRow";
import Pagination from "./Pagination";
import { AccountProps } from "./types/AccountProps";
import { useState } from "react";

const AccountViewer = ({
	id,
	name,
	total_holdings,
	holdings,
	quotes,
}: AccountProps) => {
	const [_holdings, setHoldings] = useState(holdings);
	const [profit, setProfit] = useState(0);
	const [change, setChange] = useState(0);
	const [page, setPage] = useState(1);

	const addChange = (num: number) => setChange(change + num);
	const addProfit = (num: number) => setProfit(profit + num);

	return (
		<>
			<h5>{name}</h5>
			<table className="table table-hover table-striped">
				<thead>
					<tr>
						<th scope="col">Ticker Symbol</th>
						<th scope="col">Qty.</th>
						<th scope="col">Cost Basis</th>
						<th scope="col">Current Price </th>
						<th scope="col">Today's Change</th>
						<th scope="col">Profit/Loss</th>
					</tr>
				</thead>
				<tbody>
					{_holdings.map((holding) => (
						<AccountRow
							holding={holding}
							priceData={quotes[holding.ticker_symbol]}
							addChange={addChange}
							addTotalProfit={addProfit}
						/>
					))}
				</tbody>
			</table>
			<div className="d-flex justify-content-between">
				<div className="account-info">
					<p className="fw-bold">
						Today's P/L:
						<AccountItem num={change} />
					</p>
					<p className="fw-bold">
						Total P/L:
						<AccountItem num={profit} />
					</p>
				</div>

				<Pagination page={page} setPages={setPage} totalPages={total_holdings/5} />
			</div>
		</>
	);
};

export default AccountViewer;
