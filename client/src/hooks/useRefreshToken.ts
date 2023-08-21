import { useContext } from "react";
import { axiosPrivate } from "../api/axios";
import AuthContext from "../context/AuthContext";

const useRefreshToken = () => {
	const { saveToken } = useContext(AuthContext);

	const refresh = async () => {
		try {
			const response = await axiosPrivate.get("/auth/refresh", {
				withCredentials: true,
			});

			if (response.status === 200) {
				saveToken(response.data.accessToken);
				return response.data.accessToken as string;
			} else {
				throw new Error("Invalid refresh token");
			}
		} catch (error) {
			throw error;
		}
	};
	return refresh;
};

export default useRefreshToken;
