import { QuoteProvider } from "../context/QuoteContext";
import HoldingsViewer from "./HoldingsViewer";
import Performance from "./Performance";
import SearchBar from "./SearchBar";
const Dashboard = () => {
	return (
		<div className="container">
			<QuoteProvider>
				<SearchBar />
				<Performance />
				<HoldingsViewer />
			</QuoteProvider>
		</div>
	);
};

export default Dashboard;
