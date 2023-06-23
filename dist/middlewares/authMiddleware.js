"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const auth_1 = require("../services/authentication/auth");
const TokenService_1 = require("../services/authentication/TokenService");
const authMiddleware = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const userId = authorization ? await auth_1.tokenService.verifyAccessToken(authorization) : undefined;
        req.body["user_id"] = userId;
        next();
    }
    catch (error) {
        // Handle any errors that occur during the middleware execution
        console.log(error);
        if (error instanceof TokenService_1.TokenVerificationError) {
            res.status(401).send({ message: "Invalid Token" });
        }
        else {
            res.status(500).send({
                message: "Internal Server Error",
            });
        }
    }
};
exports.authMiddleware = authMiddleware;
