import { axiosPrivate } from "../api/axios";
import { useContext, useEffect, useRef} from "react";
import useRefreshToken from "./useRefreshToken";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useAxiosPrivate = () => {
	const refresh = useRefreshToken();
	const { auth, removeToken } = useContext(AuthContext);
	const navigate = useNavigate();
	const isRefreshing = useRef(false);

	// Setup the interceptors only once during initialization
	useEffect(() => {
		const requestIntercept = axiosPrivate.interceptors.request.use(
			(config) => {
				if (!config.headers["Authorization"]) {
					config.headers[
						"Authorization"
					] = `${auth.accessToken}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		const responseIntercept = axiosPrivate.interceptors.response.use(
			(response) => response,
			async (error) => {
				const prevRequest = error?.config;
				if (error?.response?.status === 401 && !prevRequest?.sent && prevRequest.url !== "/auth/refresh") {
					prevRequest.sent = true;
					
					if (!isRefreshing.current) {
						isRefreshing.current = true;
						try {
							const newAccessToken = await refresh() as string;
							prevRequest.headers["Authorization"] =
								newAccessToken;
							isRefreshing.current = false;
							return axiosPrivate(prevRequest);
						} catch (error) {
							removeToken();
							navigate("/login");
							isRefreshing.current = false;
							return Promise.reject(error);
						}
					}

				}
				return Promise.reject(error);
			}
		);

		// Cleanup function to remove the interceptors when unmounting
		return () => {
			axiosPrivate.interceptors.request.eject(requestIntercept);
			axiosPrivate.interceptors.response.eject(responseIntercept);
		};
	}, []);

	return axiosPrivate;
};

export default useAxiosPrivate;
