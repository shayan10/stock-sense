import { axiosPrivate } from "../api/axios";
import { useContext, useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import AuthContext from "../context/AuthContext";

const useAxiosPrivate = () => {
	const refresh = useRefreshToken();
	const {auth, removeToken} = useContext(AuthContext);

	useEffect(() => {
		const requestIntercept = axiosPrivate.interceptors.request.use(config => {
			if (!config.headers["Authorization"]) {
				config.headers["Authorization"] = `${auth.accessToken}`
			}
			return config
		}, (error) => Promise.reject(error))

		const responseIntercept = axiosPrivate.interceptors.response.use(
			response => response,
			async (error) => {
				const prevRequest = error?.config;
				if (error?.response?.status === 401 && !prevRequest?.sent) {
					prevRequest.sent = true;
					console.log("Refreshing");
					try {	
						const newAccessToken = await refresh();
						prevRequest.headers["Authorization"] = newAccessToken;
						return axiosPrivate(prevRequest);	
					} catch (error) {
						removeToken();
						return Promise.reject(error);
					}
				}
				return Promise.reject(error);
			}
		);

		return () => {
			axiosPrivate.interceptors.request.eject(requestIntercept);
			axiosPrivate.interceptors.response.eject(responseIntercept);
		}
	});

	return axiosPrivate;
}

export default useAxiosPrivate;