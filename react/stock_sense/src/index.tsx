import React from "react";
import ReactDOM from "react-dom/client";
import "./css/bootstrap.min.css";
import "./css/bootstrap.min.css.map";
import "./css/styles.css";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	<React.Fragment>
		<AuthProvider>
			<BrowserRouter>
				<Navbar />
				<App />
			</BrowserRouter>
		</AuthProvider>
	</React.Fragment>
);
