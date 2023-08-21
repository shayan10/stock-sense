import { Link } from "react-router-dom";

const ErrorPage = () => {
	return (
		<div className="container error-container text-center mt-3">
			<div className="error-icon text-danger">
				<i className="fas fa-exclamation-triangle"></i>
			</div>
			<h1 className="error-heading">404</h1>
			<p className="error-message">Oops! The page you're looking for could not be found.</p>
			<Link to="/login"><button className="btn btn-primary">Go to Login Page</button></Link>
		</div>
	);
}
 
export default ErrorPage;