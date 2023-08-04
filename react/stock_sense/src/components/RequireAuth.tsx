import { useLocation, Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { useContext } from "react";

const RequireAuth = () => {
	const {auth} = useContext(AuthContext);
	const location = useLocation();
	
	return (
		auth.isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
	);
}
 
export default RequireAuth;