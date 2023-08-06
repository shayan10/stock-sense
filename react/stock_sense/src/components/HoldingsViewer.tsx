import { useContext } from "react";
import { QuoteContext } from "../context/QuoteContext";

const HoldingsViewer = () => {
	const { refresh } = useContext(QuoteContext);

	return (
		<>
			<div className="d-flex justify-content-between">
				<h2>Holdings</h2>
				<button className="btn btn-primary" onClick={refresh}>
					Refresh
				</button>
			</div>
			<hr />
		</>
	);
};

export default HoldingsViewer;
