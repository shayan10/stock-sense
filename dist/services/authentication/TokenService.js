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
exports.TokenService = exports.TokenVerificationError = void 0;
const jwt = __importStar(require("jsonwebtoken"));
class TokenVerificationError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
}
exports.TokenVerificationError = TokenVerificationError;
class TokenService {
    constructor(access_token_length, refresh_token_length, tokenBlacklist, JWT_SECRET) {
        this.access_token_length = access_token_length;
        this.refresh_token_length = refresh_token_length;
        this.tokenBlacklist = tokenBlacklist;
        this.JWT_SECRET = JWT_SECRET;
    }
    generateToken(userId, expiryMin, options = {}) {
        const currTime = Math.floor(Date.now() / 1000);
        const payload = Object.assign({ sub: userId, iat: currTime, exp: currTime + (expiryMin * 60) }, options);
        return jwt.sign(payload, this.JWT_SECRET);
    }
    async verifyToken(type, token) {
        try {
            const decodedToken = jwt.verify(token, this.JWT_SECRET, {
                ignoreExpiration: false
            });
            // Validate token
            const isValidToken = await this.tokenBlacklist.validateToken(type, token);
            if (!isValidToken || !decodedToken["sub"]) {
                throw new TokenVerificationError("Invalid Token");
            }
            return decodedToken.sub;
        }
        catch (error) {
            console.log(error);
            throw new TokenVerificationError("Invalid Token");
        }
    }
    async refresh(refreshToken) {
        try {
            // Verify existing refresh token
            const userId = await this.verifyRefreshToken(refreshToken);
            // Revoke existing tokens
            await this.revokeToken(refreshToken);
            // Get new tokens
            const tokens = this.getTokens(userId);
            return tokens;
        }
        catch (error) {
            console.log(error);
            throw new TokenVerificationError("Invalid Token");
        }
    }
    async revokeToken(refreshToken) {
        try {
            const accessToken = await this.tokenBlacklist.getAccessToken(refreshToken);
            if (!accessToken) {
                throw new TokenVerificationError("Token does not exist");
            }
            // Add to blacklist
            this.tokenBlacklist.revokeToken("access", accessToken);
            this.tokenBlacklist.revokeToken("refresh", refreshToken);
            // Remove from DB
            this.tokenBlacklist.removeTokenPair(refreshToken);
        }
        catch (error) {
            console.log(error);
            throw new TokenVerificationError("Invalid Token");
        }
    }
    getTokens(userId) {
        const accessToken = this.generateToken(userId, this.access_token_length);
        const refreshToken = this.generateToken(userId, this.refresh_token_length);
        // Commit to database
        this.tokenBlacklist.saveTokenPair(accessToken, refreshToken, userId);
        return { accessToken, refreshToken };
    }
    async verifyAccessToken(token) {
        return this.verifyToken("access", token);
    }
    async verifyRefreshToken(token) {
        return this.verifyToken("refresh", token);
    }
}
exports.TokenService = TokenService;
