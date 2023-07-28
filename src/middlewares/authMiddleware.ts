import { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/authentication/auth";
import { TokenVerificationError } from "../services/authentication/TokenService";
import { Socket } from "socket.io";

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { authorization } = req.headers;

		if (!authorization) {
			throw new TokenVerificationError("Token not received");
		}

		const userId = await tokenService.verifyAccessToken(authorization);
		console.log(userId);
		req.body["user_id"] = userId;
		next();
	} catch (error) {
		// Handle any errors that occur during the middleware execution
		if (error instanceof TokenVerificationError) {
			res.status(401).send({ message: "Invalid Token" });
		} else {
			res.status(500).send({
				message: "Internal Server Error",
			});
		}
	}
};

export const socketAuthMiddleware = async (socket: Socket, next: any) => {
	try {
		const accessToken = socket.handshake.auth.token as string;
		console.log(accessToken);
		const userId = await tokenService.verifyAccessToken(accessToken);
		socket.handshake.headers.userId = userId;
		next();
	} catch (error) {
		throw error;
	}
};
