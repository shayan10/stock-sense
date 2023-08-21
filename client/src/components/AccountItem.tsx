export const AccountItem = ({ num, comp }: { num: number, comp?: number }) => {
	const classNames = `fw-bold ${
	  num > 0
	    ? "text-success"
	    : num === (comp || 0)
	    ? "text-secondary"
	    : "text-danger"
	}`;
   
	return <span className={classNames}>{num.toFixed(2)}</span>;
};
   