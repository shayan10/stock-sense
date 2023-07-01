import * as dotenv from "dotenv";
// import { Socket } from "socket.io";

import { app } from "./app";
import { connect } from "./db/Postgres";
import { redisConnect } from "./db/Redis";
// import {
// 	ClientToServerEvents,
// 	ServerToClientEvents,
// 	InterServerEvents,
// 	SocketData,
// } from "./socket/socket";
// import { Server } from "socket.io";
import { WebSocketServer } from "ws";

// import plaidHandler from "./socket/handlers/plaidHandler";
// import { socketAuthMiddleware } from "./middlewares/authMiddleware";

// const io = new Server<
// 	ClientToServerEvents,
// 	ServerToClientEvents,
// 	InterServerEvents,
// 	SocketData
// >({
// 	cors: {
// 		origin: "http://localhost:3030",
// 		methods: ["GET", "POST"],
// 		credentials: true,
// 	},
// 	allowEIO3: true,
// 	allowUpgrades: true,
// });

// // const onConnection = (socket: Socket) => {
// // 	return plaidHandler(io, socket);
// // };

// io.on("connection", (socket: Socket) => {
// 	socket.emit("Hello", "World");
// 	// onConnection(socket);
// });

// io.listen(3030);

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
			socket.on("error", () => {
				console.log("error");
			});

			// This function is not defined on purpose. Implement it with your own logic.
			wss.handleUpgrade(request, socket, head, function done(ws) {
				wss.emit("connection", ws, request);
			});
		});

		// io.use((socket, next) => socketAuthMiddleware(socket, next));
		httpServer.listen(process.env.PORT, () => {
			console.log(`Server started on port ${process.env.PORT}`);
		});
	})
	.catch((error) => console.log(error));
