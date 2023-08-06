const Pagination = ({
	page,
	totalPages,
	setPages,
}: {
	page: number;
	totalPages: number;
	setPages: (arg: number) => void;
}) => {
	const items = [];
	for (let i = 0; i !== totalPages; i++) {
		let active = i + 1 === page ? "active" : "";
		items.push(
			<li key={i} className={"page-item" + active}>
				<p className="page-link" onClick={() => setPages(i + 1)}>
					{i + 1}
				</p>
			</li>
		);
	}

	return (
		<nav>
			<ul className="pagination pagination-sm justify-content-end">
				{items}
			</ul>
		</nav>
	);
};

export default Pagination;
