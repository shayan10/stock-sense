import { useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Dashboard = () => {
	const axios = useAxiosPrivate();

	useEffect(() => {
		async function fetchData() {
			const users = await axios.get('/holdings/positions');
			console.log(users);
		}
		fetchData();
	})

	return (<h1>Dashboard</h1>);
}
 
export default Dashboard;