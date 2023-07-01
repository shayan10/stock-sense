import * as dotenv from "dotenv";

import { app } from "./app";
import { connect } from "./db/Postgres";
import { redisConnect } from "./db/Redis";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { socketAuthMiddleware } from "./middlewares/authMiddleware";
import plaidHandler from "./socket/handlers/plaidHandler";

dotenv.config();

Promise.all([redisConnect(), connect()])
	.then(() => {
		const httpServer = createServer(app());

		const io = new Server(httpServer, {
			cors: {
				origin: "*",
				methods: ["*"],
				credentials: true,
			},
			transports: ["polling", "websocket"],
			allowUpgrades: true,
		});

		io.use((socket, next) => {
			socketAuthMiddleware(socket, next).catch((error) => {
				socket.disconnect();
				return;
			});
		});

		io.on("connection", (socket: Socket) => {
			// socket.emit("Hello", "World");
			console.log("New WebSocket connection");
			plaidHandler(io, socket);

			socket.on("message", (data: any) => {
				console.log("received: %s", data);
			});
		});

		httpServer.listen(process.env.PORT, () => {
			console.log(`Server started on port ${process.env.PORT}`);
		});
	})
	.catch((error) => console.log(error));
