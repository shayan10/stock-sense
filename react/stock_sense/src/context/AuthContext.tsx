import { createContext, useState, useEffect } from "react";

const authStateDefault = {
	accessToken: "",
	isAuthenticated: false,
};

const AuthContext = createContext<AuthContextValues>({
	auth: authStateDefault,
	saveToken: () => {},
  	removeToken: () => {}
});

interface AuthContextValues {
	auth: AuthStateValues;
	saveToken: (arg: string) => void;
  	removeToken: () => void
}

interface AuthStateValues {
	accessToken: string;
	isAuthenticated: boolean;
}

export const AuthProvider = ({ children }: any) => {
	const [auth, setAuth] = useState<AuthStateValues>(authStateDefault);
	const [isAuthInitialized, setIsAuthInitialized] = useState(false);

	useEffect(() => {
		// Check if the accessToken is available in localStorage
		const accessToken = localStorage.getItem("accessToken") || "";
		if (!accessToken) {
			setAuth({
				accessToken: "",
				isAuthenticated: false,
			});
		} else {
			setAuth({
				accessToken,
				isAuthenticated: true,
			});
		}
		setIsAuthInitialized(true);
	}, []);

	const saveToken = (accessToken: string) => {
		localStorage.setItem("accessToken", accessToken);
		setAuth({
			accessToken,
			isAuthenticated: true,
		});
	};

	const removeToken = () => {
		if (localStorage.getItem("accessToken")) {
			localStorage.removeItem("accessToken");
			setAuth({
				accessToken: '',
				isAuthenticated: false,
			});
		}
	};

	if (!isAuthInitialized) {
		// You can render a loading screen or placeholder content here
		return <div>Loading...</div>;
	}

	return (
		<AuthContext.Provider value={{ auth, saveToken, removeToken }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
