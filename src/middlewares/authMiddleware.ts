import { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/authentication/auth";
import { TokenVerificationError } from "../services/authentication/TokenService";
export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { authorization } = req.headers;

		if (!authorization) {
			throw TokenVerificationError;
		}

		const userId = await tokenService.verifyAccessToken(authorization);
		req.body["user_id"] = userId;

		next();
	} catch (error) {
		// Handle any errors that occur during the middleware execution
		next(error);
	}
};
