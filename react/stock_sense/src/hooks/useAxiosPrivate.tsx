import { axiosPrivate } from "../api/axios";
import { useContext, useEffect} from "react";
import useRefreshToken from "./useRefreshToken";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useAxiosPrivate = () => {
	const refresh = useRefreshToken();
	const { auth, removeToken } = useContext(AuthContext);
	const navigate = useNavigate();

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
				console.log(prevRequest);
				if (error?.response?.status === 401 && !prevRequest?.sent) {
					prevRequest.sent = true;
					try {
						const newAccessToken = await refresh();
						prevRequest.headers["Authorization"] =
							newAccessToken;
						return axiosPrivate(prevRequest);
					} catch (error) {
						removeToken();
						navigate('/login');
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
	}, [auth, refresh, removeToken]);

	return axiosPrivate;
};

export default useAxiosPrivate;
