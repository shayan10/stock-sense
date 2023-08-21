import IconDisplay from "./IconDisplay";
import { HoldingProps } from "./types/HoldingProps";

const HoldingInfo = ({ ticker_symbol, quote }: HoldingProps) => {
	return (
		<>
			<div className="d-flex gap-5 justify-content-start my-2 mx-0">
				<h2 className="mr-3">{ticker_symbol}</h2>
				<h2 className={"mr-3 " + ((quote.current_price - quote.previous_close) > 0 ? "text-success" : "text-danger")}><IconDisplay num={(quote.current_price - quote.previous_close) } />${quote.current_price}</h2>
				<h2 className={"mr-3 " + ((quote.current_percent_change) > 0 ? "text-success" : "text-danger")}><IconDisplay num={quote.current_percent_change} />{quote.current_percent_change}%</h2>
			</div>
			<hr />
		</>
	);
};

export default HoldingInfo;
