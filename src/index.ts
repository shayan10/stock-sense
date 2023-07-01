import * as dotenv from "dotenv";

import { app } from "./app";
import { connect } from "./db/Postgres";
import { redisConnect } from "./db/Redis";

import { WebSocketServer } from "ws";
import { socketAuthMiddleware } from "./middlewares/authMiddleware";

dotenv.config();

Promise.all([redisConnect(), connect()])
	.then(() => {
		const httpServer = app();

		const wss = new WebSocketServer({
			noServer: true,
			path: "/plaid-ws/",
		});

		wss.on("connection", function connection(ws) {
			ws.on("error", console.error);

			ws.on("message", function message(data) {
				console.log("received: %s", data);
			});

			ws.send("something");
		});

		httpServer.on("upgrade", function upgrade(request, socket, head) {
			console.log("Upgraded");

			const onSocketError = () => {
				console.log("error");
			};

			socket.on("error", onSocketError);

			socketAuthMiddleware(request)
				.then(() => {
					socket.removeListener("error", onSocketError);
					// This function is not defined on purpose. Implement it with your own logic.
					wss.handleUpgrade(
						request,
						socket,
						head,
						function done(ws) {
							wss.emit("connection", ws, request);
						}
					);
				})
				.catch((error) => {
					socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
					socket.destroy();
					return;
				});
		});

		httpServer.listen(process.env.PORT, () => {
			console.log(`Server started on port ${process.env.PORT}`);
		});
	})
	.catch((error) => console.log(error));
