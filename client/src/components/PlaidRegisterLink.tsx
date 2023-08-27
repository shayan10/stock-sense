import { useCallback, useContext, useEffect, useState } from "react";
import {
	PlaidLinkOnExit,
	PlaidLinkOnSuccess,
	PlaidLinkOnSuccessMetadata,
	PlaidLinkOptions,
	usePlaidLink,
} from "react-plaid-link";
import {
	exchangeAccessToken,
	fetchLinkToken,
	initializeUserAccounts,
} from "../services/Plaid";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { AccountProps } from "./Accounts/types/AccountProps";
import { fetchAccounts } from "../services/Accounts";
import { QuoteContext } from "../context/QuoteContext";

const PlaidRegisterLink = ({
	setLoading,
	setAccounts,
}: {
	setLoading: (arg: boolean) => void;
	setAccounts: (args: AccountProps[]) => void;
}) => {
	const axios = useAxiosPrivate();
	const [linkToken, setLinkToken] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const { refresh } = useContext(QuoteContext);

	useEffect(() => {
		setLoading(true);
		fetchLinkToken(axios)
			.then((token) => {
				setLinkToken(token);
				setErrorMsg("");
			})
			.catch((error) => setErrorMsg("Cannot fetch linked token"));
		setLoading(false); // Always set loading to false after fetching
	}, []);

	const onSuccessCallback = useCallback<PlaidLinkOnSuccess>(
		async (
			public_token: string,
			metadata: PlaidLinkOnSuccessMetadata
		) => {
			try {
				setLoading(true); // Set loading to true before async operations

				await exchangeAccessToken(axios, public_token);

				await initializeUserAccounts(axios);

				const accounts = await fetchAccounts(axios);

				setAccounts(accounts);
				refresh();
			} catch (error) {
				setErrorMsg("Unable to retrieve your data from Plaid.");
			} finally {
				setLoading(false); // Always set loading to false after async operations
			}
		},
		[]
	);

	const onExitCallback = useCallback<PlaidLinkOnExit>(
		async (error, metadata) => {
			if (error != null && error.error_code === "INVALID_LINK_TOKEN") {
				// generate new link token
				try {
					setLoading(true);
					const newLinkToken = await fetchLinkToken(axios);
					setLinkToken(newLinkToken);
					setLoading(false);
				} catch (error) {
					setErrorMsg("Unable to connect to plaid");
				}
			}
		},
		[]
	);

	const config: PlaidLinkOptions = {
		onSuccess: onSuccessCallback,
		onExit: onExitCallback,
		onEvent: (eventName, metadata) => {},
		token: linkToken,
		//required for OAuth; if not using OAuth, set to null or omit:
		receivedRedirectUri: undefined,
		env: "sandbox",
	};

	const { open, ready } = usePlaidLink(config);

	return (
		<>
			<p className="text-center">
				Looks like you have not registered with Plaid yet.
				<button
					disabled={!ready && errorMsg !== ""}
					onClick={(e) => open()}
					className="text-decoration-underline"
					style={{ color: "blue" }}
				>
					Click here to start the process
				</button>
			</p>
		</>
	);
};

export default PlaidRegisterLink;
