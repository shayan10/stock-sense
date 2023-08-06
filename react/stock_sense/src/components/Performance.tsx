import { useContext, useEffect } from "react";
import { QuoteContext } from "../context/QuoteContext";
import { getTotalChange, getCurrentChange } from "../services/Quotes";
import PortfolioChangeInfo from "./PortfolioChangeInfo";

const Performance = () => {
	const {quotes, positions} = useContext(QuoteContext);
	useEffect(() => {
		console.log(quotes);
		console.log(positions);
	}, [quotes, positions]);
	return (
		<section id="performance" className="my-3">
			<div className="d-flex justify-content-center gap-5 text-wrap">
				<PortfolioChangeInfo change={getCurrentChange(quotes, positions)} prompt="Today" />
				<PortfolioChangeInfo change={getTotalChange(quotes, positions)} prompt="Total" />
			</div>
		</section>
	);
}
 
export default Performance;