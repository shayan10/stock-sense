"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const AuthenticationController_1 = require("../services/authentication/AuthenticationController");
const authMiddleware = async (req, res, next) => {
    const { Authorization } = req.headers;
    if (!Authorization) {
        res.status(401);
        return;
    }
    const access_token = Authorization[0] || Authorization;
    const validAccessToken = await AuthenticationController_1.authController.verifyAccessToken(access_token);
    if (!validAccessToken) {
        res.status(401);
    }
    else {
        next();
    }
};
exports.authMiddleware = authMiddleware;
