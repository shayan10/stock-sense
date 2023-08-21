import { AxiosInstance } from "axios";
import { AccountProps } from "../components/Accounts/types/AccountProps";

export const fetchAccounts = async (axios: AxiosInstance) => {
	const accounts = await axios.get("/account");
	return accounts.data as AccountProps[];
};
