import stockImage from "./GettyImages-1445474970-aea62fdd148e4ac08e59c3825ce5465a.jpg";
import { News } from "./types/HoldingProps";
import { Link } from "react-router-dom";

const NewsItem = ({ headline, image, url, summary }: News) => {
	return (
		<>
			<div className="news-card">
				<div className="news-card-img">
					<img
						className="card-img-top"
						src={image === "" ? stockImage : image}
						alt={headline}
					/>
				</div>
				<Link
					to={url}
					style={{ textDecoration: "none", color: "black" }}
					target="_blank"
					rel="noopener noreferrer"
				>
					<div className="news-card-body">
						<p className="news-card-title">{headline}</p>
						<p className="news-card-text">{summary}</p>
					</div>
				</Link>
			</div>
			<hr />
		</>
	);
};

export default NewsItem;
