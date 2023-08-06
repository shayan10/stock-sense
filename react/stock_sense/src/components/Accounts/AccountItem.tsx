export const AccountItem = ({num}: {num: number}) => {
	return (<span className={
		num > 0 ? "text-success" : num === 0 ? "text-secondary" : "text-danger"
	}>{num}</span>)
}