const HeaderItem = ({num}: {num: number}) => {
	return (
		<>
			{
			num > 0 ? 
			<svg xmlns="http://www.w3.org/2000/svg" style={{color: "green"}} width="32" height="32" fill="currentColor" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
				<path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
			</svg>
			:
			<svg xmlns="http://www.w3.org/2000/svg" style={{color: "red"}} width="32" height="32" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
				<path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
			</svg>
			}
		</>
	);
}
 
export default HeaderItem;