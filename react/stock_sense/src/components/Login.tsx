import { FormEvent, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { axiosPrivate } from "../api/axios";
import AuthContext from "../context/AuthContext";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState('');
	const {auth, saveToken} = useContext(AuthContext);
	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		try {
			const response = await axiosPrivate.post("/auth/login", {
				username, password
			});

			const { accessToken } = response.data as { accessToken: string };
			saveToken(accessToken);
			navigate('/dashboard');
		} catch (error) {
			console.log(error);
			setError("Invalid Credentials Provided");
		}	                                      
	}

	useEffect(() => {
		// If already authenticated, then redirect to dashboard
		if (auth.isAuthenticated) {
			navigate('/dashboard')
		}
		// Reset error state
		setError('');
	}, [username, password, auth.isAuthenticated, navigate])

	return (
		<div className="container mt-3">
			<div>
				<h1 className="text-center">Login Page</h1>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label htmlFor="exampleInputEmail1" className="form-label"
							>Username</label>
						<input
							type="text"
							className="form-control"
							aria-describedby="emailHelp"
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>
					<div className="mb-3">
						<label
							htmlFor="exampleInputPassword1"
							className="form-label"
							>Password</label>
						<input
							type="password"
							className="form-control"
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<button
						type="submit"
						className="mt-3 btn btn-lg btn-primary button"
					>
						Submit
					</button>
					{error !== '' && <div className="text-danger">{error}</div>}
				</form>
			</div>
		</div>
	);
}
 
export default Login;