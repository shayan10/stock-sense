const PortfolioChangeInfo = ({
	change,
	prompt,
}: {
	change: number;
	prompt: string;
}) => {
	return (
		<p className="fs-4 fw-normal">
			<span
				className={
					change > 0
						? "text-success"
						: change === 0
						? "text-secondary"
						: "text-danger"
				}
			>
				{change}%
			</span>{" "}
			{prompt}
		</p>
	);
};

export default PortfolioChangeInfo;
