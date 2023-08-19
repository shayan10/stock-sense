import express from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import apiRouter from "./api";

import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { WebSocket } from "ws";
import { redisClient } from "./db/Redis";
import { Server } from "socket.io";

const { FINNHUB_API_KEY } = process.env;
export const finnhubWS = new WebSocket(
	`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`
);

export const io = new Server({
	cors: {
		origin: "http://localhost:3001",
	},
});

io.on("connection", (socket) => {
	socket.on("message", async (message) => {
		try {
			const response = JSON.parse(message.toString());
			const { ticker_symbol } = response;

			if (!ticker_symbol) {
				throw new Error("Missing ticker_symbol in request");
			}

			console.log("Message received: ", message);

			// Join the room associated with the ticker symbol
			socket.join(ticker_symbol);

			io.to(`${ticker_symbol}`).emit("quote");
			// Store the ticker_symbol in Redis
			await redisClient.set(socket.id, ticker_symbol);
			console.log(socket.rooms);

			// Subscribe to Finnhub API
			finnhubWS.send(
				JSON.stringify({ type: "subscribe", symbol: ticker_symbol })
			);
		} catch (error) {
			console.error("Error handling client message:", error);
			// Close the client's connection in case of an error
			socket.disconnect();
		}
	});

	// Handle messages from Finnhub WebSocket
	finnhubWS.on("message", (data) => {
		try {
			//const response = JSON.parse(data.toString());
			const quote = [
				{
					c: ["1", "24", "12"],
					p: 217.15,
					s: "PAYX",
					t: 1692400114538,
					v: 1,
				},
			];
			console.log(quote);
			// if (!Array.isArray(quote) || !quote) {
			// 	throw new Error("Invalid quote data received from Finnhub");
			// }

			// Broadcast the quote data to all clients in the room (ticker symbol)
			io.to(quote[0].s).emit("quote", JSON.stringify(quote));
		} catch (error) {
			console.error("Error handling Finnhub message:", error);
		}
	});

	socket.on("close", async () => {
		try {
			const room = await redisClient.get(socket.id);
			if (room) {
				socket.leave(room);
				console.log("Leaving room: ", room);
			}
			redisClient.del(socket.id);
			console.log("Disconnecting...");
		} catch (error) {
			console.error("Error handling client close:", error);
			// Close the client's connection in case of an error
			socket.disconnect();
		}
	});
});

export const app = () => {
	const _app = express();

	_app.use(helmet());
	_app.use(bodyParser.json());
	_app.use(bodyParser.urlencoded({ extended: true }));
	_app.use(cookieParser());
	_app.use(
		cors({
			credentials: true,
			origin: "http://localhost:3001",
		})
	);

	_app.use(apiRouter, errorHandler);
	return _app;
};
