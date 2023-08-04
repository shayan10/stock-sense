import { useContext } from "react";
import { axiosPrivate } from "../api/axios";
import AuthContext from "../context/AuthContext";

const useRefreshToken = () => {
	const { saveToken } = useContext(AuthContext);

	const refresh = async () => {
		const response = await axiosPrivate.post("/auth/refresh");

		saveToken(response.data.accessToken);
		return response.data.accessToken;
	};
	return refresh;
};

export default useRefreshToken;
