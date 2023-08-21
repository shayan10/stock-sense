import { axiosPrivate } from "../api/axios";
import { useContext, useEffect} from "react";
import useRefreshToken from "./useRefreshToken";
import AuthContext from "../context/AuthContext";

const useAxiosPrivate = () => {
	const refresh = useRefreshToken();
	const { auth } = useContext(AuthContext);
	//const navigate = useNavigate();

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
				// console.log(prevRequest);
				if (error?.response?.status === 401 && !prevRequest?.sent && prevRequest.url !== "/auth/refresh") {
					prevRequest.sent = true;
					
					try {
						const newAccessToken = await refresh() as string;
						prevRequest.headers["Authorization"] =
							newAccessToken;
						return axiosPrivate(prevRequest);
					} catch (error) {
						return Promise.reject(error);
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
	}, [auth]);

	return axiosPrivate;
};

								// refresh().then((token) => {
					// 	prevRequest.headers["Authorization"] =
					// 	token;
					// 	return axiosPrivate(prevRequest);
					// }).catch((error) => {
					// 	console.log("")
					// 	removeToken();
					// 	return error;
					// })
					

export default useAxiosPrivate;
