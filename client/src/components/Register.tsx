import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { axiosPrivate } from "../api/axios";
import { AxiosError, AxiosResponse } from "axios";

const Register = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [first_name, setFirstName] = useState("");
	const [last_name, setLastName] = useState("");

	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		try {
			const response: AxiosResponse = await axiosPrivate.post("/users/register", {
				username, password, first_name, last_name
			});
			
			if (response.status === 200) {
				navigate('/login');	
			}
		} catch (error) {
			if (error instanceof AxiosError) {
				const usernameResponse: string | string[] | undefined = error.response?.data.username;
				if (usernameResponse && typeof(usernameResponse) != 'string') {
					setError(`The username ${username} has been taken`)
				}
			}
			console.log(error);
		}
			                                      
	}

	useEffect(() => {
		// Reset error state
		setError('');
	}, [username, password])

	return (
		<div className="container mt-3">
			<div>
				<h1 className="text-center">Register Page</h1>
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
					<div className="input-group">
						<span className="input-group-text"
							>First and last name</span>
						<input
							type="text"
							aria-label="First name"
							className="form-control"
							placeholder="John"
							onChange={(e) => setFirstName(e.target.value)}
						/>
						<input
							type="text"
							aria-label="Last name"
							className="form-control"
							placeholder="Doe"
							onChange={(e) => setLastName(e.target.value)}
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
 
export default Register;