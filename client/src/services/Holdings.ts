import { AxiosInstance } from "axios";
import { HoldingProps } from "../components/Positions/types/HoldingProps";

export const fetchHoldingDetail = async (axios: AxiosInstance, id: number) => {
	const detail = await axios.get(`/holdings/${id}`);
	return detail.data as HoldingProps;
};
