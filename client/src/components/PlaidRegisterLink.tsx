import { useCallback, useEffect, useState } from "react";
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

const PlaidRegisterLink = () => {
	const axios = useAxiosPrivate();
	const navigate = useNavigate();
	const [linkToken, setLinkToken] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	
	useEffect(() => {
		fetchLinkToken(axios)
			.then((token) => {
				setLinkToken(token);
				setErrorMsg("");
			})
			.catch((error) => setErrorMsg("Cannot fetch linked token"));
		
	}, []);

	const onSuccessCallback = useCallback<PlaidLinkOnSuccess>(
		async (
			public_token: string,
			metadata: PlaidLinkOnSuccessMetadata
		) => {
			try {
				await exchangeAccessToken(axios, public_token);
				setIsProcessing(true);
				initializeUserAccounts(axios).then(() => {
					navigate("/dashboard");
					setIsProcessing(false);
				});
			} catch (error) {
				setErrorMsg("Unable to retrieve your data from Plaid.");
			}
		},
		[]
	);

	const onExitCallback = useCallback<PlaidLinkOnExit>(
		async (error, metadata) => {
			// log and save error and metadata
			// handle invalid link token
			if (error != null && error.error_code === "INVALID_LINK_TOKEN") {
				// generate new link token
				try {
					const newLinkToken = await fetchLinkToken(axios);
					setLinkToken(newLinkToken);
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
		env: "sandbox"
	};

	const { open, ready } = usePlaidLink(config);

	return (
		<>
			{isProcessing ? (
				<div className="spinner-border text-center" role="status">
					<span className="sr-only"></span>
				</div>
			) : (
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
			)}
		</>
	);
};

export default PlaidRegisterLink;
