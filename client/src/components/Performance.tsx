import { useContext } from "react";
import { QuoteContext } from "../context/QuoteContext";
import { getTotalChange, getCurrentChange } from "../services/Quotes";
import PortfolioChangeInfo from "./PortfolioChangeInfo";

const Performance = () => {
	const {quotes, positions} = useContext(QuoteContext);

	return (
		<section id="performance" className="my-5">
			<div className="d-flex justify-content-center gap-5 text-wrap">
				<PortfolioChangeInfo change={getCurrentChange(quotes, positions)} prompt="Today" />
				<PortfolioChangeInfo change={getTotalChange(quotes, positions)} prompt="Total" />
			</div>
		</section>
	);
}
 
export default Performance;