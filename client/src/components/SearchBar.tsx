const SearchBar = () => {
	return (
		<section className="input-group mt-4 mb-4 search-bar">
			<input
				type="text"
				className="form-control"
				placeholder="Ticker Symbol (e.g. MSFT)"
			/>
			<button type="submit" className="btn btn-outline-success">
				Search
			</button>
		</section>
	);
}
 
export default SearchBar;