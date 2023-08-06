import { useEffect } from "react";
import { AccountRowProps } from "./types/AccountProps";
import { AccountItem } from "./AccountItem";

const percentDiff = (x: number, y: number): number => {
	return parseInt(((x - y) / y * 100).toFixed(2));
}

const AccountRow = ({holding, priceData, addChange, addTotalProfit}: AccountRowProps) => {
	
	useEffect(() => {
		addTotalProfit((priceData.current_price - holding.cost_basis) * holding.quantity);
		addChange((priceData.current_price - priceData.previous_close) * holding.quantity)
	})
	return (
		<tr>
			<th scope="row" className="">
				<span className="ticker-header">{holding.ticker_symbol}</span>
				<i
					className="ticker-arrow bi bi-chevron-right"
				></i>
			</th>
			<td>{holding.quantity}</td>
			<td>{holding.cost_basis}</td>
			<td>$<AccountItem num={priceData.current_price} /></td>
			<td><AccountItem num={percentDiff(priceData.current_price, priceData.previous_close)} />%</td>
			<td><AccountItem num={percentDiff(priceData.current_price, holding.cost_basis)} />%</td>
		</tr>
	);
}

export default AccountRow;