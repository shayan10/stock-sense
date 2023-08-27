import React, { useContext, useEffect, useState } from "react";
import { QuoteContext } from "../context/QuoteContext";
import { AccountProps } from "./Accounts/types/AccountProps";
import AccountViewer from "./Accounts/AccountViewer";
import PlaidRegisterLink from "./PlaidRegisterLink";
import ClipLoader from "react-spinners/ClipLoader";

const HoldingsViewer = ({
	accounts,
	setAccounts,
}: {
	accounts: AccountProps[];
	setAccounts: (args: AccountProps[]) => void;
}) => {
	const { refresh } = useContext(QuoteContext);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const interval = setInterval(refresh, 20000);

		// Return a cleanup function to clear the interval when the component unmounts
		return () => {
			clearInterval(interval);
		};
	}, []); // Include "refresh" in the dependency array to re-create the interval if it changes

	return (
		<>
			{loading ? (
				<div
					style={{
						width: "100px",
						margin: "auto",
						display: "block",
					}}
				>
					<ClipLoader color="#52bfd9" size={100} />
				</div>
			) : (
				<>
					<div className="d-flex justify-content-between">
						<h2>Holdings</h2>
						<button
							className="btn btn-primary"
							onClick={refresh}
						>
							Refresh
						</button>
					</div>
					<hr />
					{accounts.length === 0 ? (
						<PlaidRegisterLink
							setAccounts={setAccounts}
							setLoading={setLoading}
						/>
					) : (
						accounts.map((account) => {
							return (
								<AccountViewer
									key={account.id}
									{...account}
								/>
							);
						})
					)}
				</>
			)}
		</>
	);
};

export default HoldingsViewer;
