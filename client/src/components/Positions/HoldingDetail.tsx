import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { fetchHoldingDetail } from "../../services/Holdings";
import PerformanceViewer from "./PerformanceViewer";
import { HoldingProps } from "./types/HoldingProps";
import NewsItem from "./NewsItem";
import HoldingInfo from "./HoldingInfo";
import Graph from "../Graphs/Graph";
import ClipLoader from "react-spinners/ClipLoader";

const HoldingDetail = () => {
	const { id } = useParams();
	const axios = useAxiosPrivate();
	const [error, setError] = useState("");
	const [holdingData, setHoldingData] = useState<HoldingProps>();

	useEffect(() => {
		if (!id) {
			console.log("No ID Provided");
			return;
		}
		fetchHoldingDetail(axios, parseInt(id))
			.then((data) => {
				console.log(data);
				setHoldingData(data);
				setError("");
			})
			.catch((error) => {
				setError("Holding not found");
			});
	}, []);

	return (
		<div
			className="container mt-3"
			style={{
				maxWidth: window.innerWidth > 1500 ? "1500px" : "none",
			}}
		>
			{error !== "" ? (
				<h2 className="text-center">{error}</h2>
			) : holdingData ? (
				<>
					<div className="row">
						<HoldingInfo {...holdingData} />
						<div className="my-3 mx-0 col-xl-8">
							<div className="graph">
								<Graph {...holdingData} />
							</div>
						</div>
						<div className="mt-3 d-md-block col-xl-4 news">
							{holdingData ? (
								holdingData.news.map((news) => (
									<NewsItem
										key={news.headline}
										{...news}
									/>
								))
							) : (
								<h2>Loading...</h2>
							)}
						</div>
					</div>
					<hr />
					{holdingData ? (
						<PerformanceViewer {...holdingData} />
					) : (
						<h2>Loading...</h2>
					)}
				</>
			) : (
				<div
					style={{
						width: "100px",
						margin: "auto",
						display: "block",
					}}
				>
					<ClipLoader color="#52bfd9" size={100} />
				</div>
			)}
		</div>
	);
};

export default HoldingDetail;
