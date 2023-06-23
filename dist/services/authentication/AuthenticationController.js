"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthenticationController = exports.AuthenticationError = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const AuthRepo_1 = require("./AuthRepo");
const bcrypt_1 = require("bcrypt");
class AuthenticationError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
}
exports.AuthenticationError = AuthenticationError;
// TODO: Implement logout functionality
class AuthenticationController {
    constructor() {
        // Expiration Time In Minutes
        this.ACCESS_TOKEN_LENGTH = 15;
        this.REFRESH_TOKEN_LENGTH = 24 * 60;
        this.authRepo = new AuthRepo_1.AuthenticationRepo();
    }
    // Verify the access token
    async verifyAccessToken(accessToken) {
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET not defined");
            }
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            const userId = decoded.sub;
            if (!userId) {
                return false;
            }
            // Perform additional checks to validate if the token belongs to the user
            const isValidToken = this.authRepo.isValidAccessToken(parseInt(userId), accessToken);
            if (!isValidToken) {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // Verify the refresh token
    async verifyRefreshToken(refreshToken) {
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET not defined");
            }
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, {
                ignoreExpiration: false
            });
            const userId = decoded.sub;
            if (!userId) {
                return false;
            }
            // Perform additional checks to validate if the token belongs to the user
            const isValidToken = await this.authRepo.isValidRefreshToken(parseInt(userId), refreshToken);
            if (!isValidToken) {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    generateTokens(id) {
        // Note: Timestamps are in seconds
        const accessIAP = Math.floor(Date.now() / 1000);
        const accessExp = accessIAP + this.ACCESS_TOKEN_LENGTH * 60;
        let payload = {
            sub: id,
            exp: accessExp,
            iat: accessIAP
        };
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not defined");
        }
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET);
        payload.exp = accessIAP + this.REFRESH_TOKEN_LENGTH * 60;
        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET);
        return { accessToken, refreshToken };
    }
    async authenticate(username, passwordPlaintext) {
        try {
            // Validate username and password
            const { id, first_name, last_name, password } = await this.authRepo.findByUsername(username);
            const validPassword = await (0, bcrypt_1.compare)(passwordPlaintext, password);
            if (!validPassword) {
                throw new AuthenticationError("Invalid Credentials");
            }
            const tokens = this.generateTokens(id);
            await this.authRepo.insertTokens(id, tokens.accessToken, tokens.refreshToken);
            return Object.assign({ username,
                first_name,
                last_name }, tokens);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AuthenticationController = AuthenticationController;
exports.authController = new AuthenticationController();
