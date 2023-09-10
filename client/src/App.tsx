import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import RequireAuth from "./components/RequireAuth";
import HoldingDetail from "./components/Positions/HoldingDetail";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Register from "./components/Register";

function App() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route element={<RequireAuth />}>
				<Route path="/" element={<Dashboard />} />
				<Route path="/holdings/:id" Component={HoldingDetail} />
			</Route>
		</Routes>
	);
}

export default App;
