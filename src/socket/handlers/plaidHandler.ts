import { Server, Socket } from "socket.io";

const handler = (io: Server, socket: Socket) => {
	// TODO: Insert Message Queue Implementation
	socket.emit("plaid-initialize", "got it");
};

export default handler;
