const ErrorPage = () => {
	return (
		<div className="container error-container">
			<div className="error-icon text-danger">
				<i className="fas fa-exclamation-triangle"></i>
			</div>
			<h1 className="error-heading">404</h1>
			<p className="error-message">Oops! The page you're looking for could not be found.</p>
			<a href="/" className="btn btn-primary">Go Back to Home</a>
		</div>
	);
}
 
export default ErrorPage;