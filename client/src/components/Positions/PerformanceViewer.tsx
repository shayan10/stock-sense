import { HoldingProps } from "./types/HoldingProps";
import { AccountItem } from "../AccountItem";
import { useEffect, useState } from "react";

const PerformanceViewer = ({metrics, historicalPrices, ticker_symbol, quantity, quote, cost_basis}: HoldingProps) => {
	const [currHighPerChange, setCurrHighPerChange] = useState(0);
	const [currLowPerChange, setCurrLowPerChange] = useState(0);

	useEffect(() => {
		setCurrHighPerChange((quote.high - quote.current_price)/quote.current_price * 100);
		setCurrLowPerChange((quote.low - quote.current_price)/quote.current_price * 100);
	}, [])
	return (
		<div className="performance-viewer d-md-block d-xl-flex justify-content-between gap-3">
			<div className="position-detail flex-grow-3">
				<h5 className="text-center display-4 text-success">
					${(quote.current_price*quantity).toFixed(2)}
				</h5>
				<div className="position-stats">
					<p>Cost Basis: ${(cost_basis*quantity).toFixed(2)}</p>
					<p>
						P/L: <span className={quote.current_price - cost_basis > 0 ? "text-success" : "text-danger"}>${((quote.current_price - cost_basis)*quantity).toFixed(2)}</span>
					</p>
				</div>
			</div>
			<div className="mt-3 flex-grow-1">
				<h4>Performane Metrics</h4>
				<table className="table  px-0">
					<thead>
						<tr>
							<th scope="col"></th>
							<th scope="col">High</th>
							<th scope="col">Low</th>
							<th scope="col">%-Change High</th>
							<th scope="col">%-Change Low</th>
						</tr>
					</thead>
					<tbody className="table-group-divider">
						<tr>
							<th scope="row">52-Week</th>
							<td className="fw-bold text-success">{metrics.high}</td>
							<td className="fw-bold text-danger">{metrics.low}</td>
							<td><AccountItem num={metrics.high_per_change} />%</td>
							<td><AccountItem num={metrics.low_per_change} />%</td>
						</tr>
						<tr>
							<th scope="row">Current</th>
							<td className="fw-bold text-success">{quote.high}</td>
							<td className="fw-bold text-danger">{quote.low}</td>
							<td><AccountItem num={currHighPerChange} />%</td>
							<td><AccountItem num={currLowPerChange} />%</td>
						</tr>
					</tbody>
				</table>
				<div className="details-row">
					<p className="me-4">
						<span className="fw-bold">Open: </span>
						${quote.open}
					</p>
					<p className="me-4">
						<span className="fw-bold">Previous Close: </span>
						${quote.previous_close}
					</p>
				</div>
			</div>
		</div>
	);
};

export default PerformanceViewer;
