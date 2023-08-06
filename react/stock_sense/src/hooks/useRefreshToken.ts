import { useContext } from "react";
import axios from "../api/axios";
import AuthContext from "../context/AuthContext";

const useRefreshToken = () => {
	const { saveToken } = useContext(AuthContext);

	const refresh = async () => {
		const response = await axios.get("/auth/refresh", {
			withCredentials: true,
		});

		if (response.status !== 200) {
			throw new Error("Invalid refresh token");
		}
		saveToken(response.data.accessToken);
		return response.data.accessToken;
	};
	return refresh;
};

export default useRefreshToken;
