import { AxiosInstance } from "axios";
// import { useCallback } from "react";
// import { PlaidLinkOnSuccess, PlaidLinkOnSuccessMetadata, PlaidLinkOptions } from "react-plaid-link";

export const fetchLinkToken = async (axios: AxiosInstance) => {
	const response = await axios.get("/plaid/link-token");
	const token = response.data.linkToken as string;
	return token;
};

export const exchangeAccessToken = async (
	axios: AxiosInstance,
	public_token: string
) => {
	await axios.post("/plaid/access-token", {
		public_token,
	});
	return;
};

export const initializeUserAccounts = async (axios: AxiosInstance) => {
	const response = await axios.get("/plaid/initialize");
	if (response.status !== 201) {
		throw new Error("Error! Unable to fetch accounts");
	}
};

// export const config = (linkToken: string): PlaidLinkOptions => {
// 	return {
// 		onSuccess: (public_token, metadata) => {},
// 		onExit: (err, metadata) => {},
// 		onEvent: (eventName, metadata) => {},
// 		token: linkToken,
// 		receivedRedirectUri: undefined,
// 	};
// };
