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
exports.TokenBlacklist = void 0;
const Redis_1 = require("../../db/Redis");
const Postgres_1 = require("../../db/Postgres");
const jwt = __importStar(require("jsonwebtoken"));
class TokenBlacklist {
    constructor(JWT_SECRET) {
        this.JWT_SECRET = JWT_SECRET;
    }
    async validateToken(type, token) {
        return await Redis_1.redisClient.exists(`${type}-blacklist:${token}`) !== 1;
    }
    async revokeToken(type, token) {
        const decodedToken = jwt.verify(token, this.JWT_SECRET, {
            ignoreExpiration: false,
            ignoreNotBefore: false
        });
        const expTime = decodedToken.exp || 0;
        const remainingTime = expTime - Math.floor(Date.now() / 1000);
        await Redis_1.redisClient.set(`${type}-blacklist`, token, "PXAT", remainingTime);
    }
    async saveTokenPair(accessToken, refreshToken, userId) {
        await Postgres_1.db.insertInto("tokens").values({
            access_token: accessToken,
            refresh_token: refreshToken,
            user_id: parseInt(userId)
        }).execute();
    }
    async removeTokenPair(refreshToken) {
        await Postgres_1.db.deleteFrom("tokens").where("refresh_token", '=', refreshToken).execute();
    }
    async getAccessToken(refreshToken) {
        const result = await Postgres_1.db.selectFrom("tokens").where("refresh_token", "=", refreshToken).select("access_token").executeTakeFirst();
        return result === null || result === void 0 ? void 0 : result.access_token;
    }
}
exports.TokenBlacklist = TokenBlacklist;
