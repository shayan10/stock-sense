import { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/authentication/auth";
import { TokenVerificationError } from "../services/authentication/TokenService";
import { JsonWebTokenError } from "jsonwebtoken";

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
		req.body["user_id"] = userId;
		next();
	} catch (error) {
		// Handle any errors that occur during the middleware execution
		if (
			error instanceof TokenVerificationError ||
			error instanceof JsonWebTokenError
		) {
			res.status(401).send({ message: "Invalid Token" });
		} else {
			res.status(500).send({
				message: "Internal Server Error",
			});
		}
	}
};
