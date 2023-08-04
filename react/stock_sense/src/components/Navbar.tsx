import { Link } from "react-router-dom";
import { useContext } from "react";

import AuthContext from "../context/AuthContext";

const Navbar = () => {
	const { auth } = useContext(AuthContext);
	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
			<div className="container-xl">
				<Link to="/" className="navbar-brand">
					StockSense
				</Link>
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarSupportedContent"
					aria-controls="navbarSupportedContent"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				{auth.isAuthenticated && (
					<div
						className="collapse navbar-collapse d-xl-flex justify-content-between"
						id="navbarSupportedContent"
					>
						<ul className="navbar-nav me-auto mb-2 mb-lg-0">
							<li className="nav-item">
								<Link
									to="/"
									className="nav-link active"
								>
									Home
								</Link>
							</li>
							<li className="nav-item">
								<Link
									to="/"
									className="nav-link active"
								>
									Home
								</Link>
							</li>
						</ul>
						<div className="nav-item end-0">
							<span className="text-white text-decoration-none">
								Logout
							</span>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
