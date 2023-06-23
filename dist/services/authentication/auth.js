"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.tokenService = void 0;
const TokenBlacklist_1 = require("./TokenBlacklist");
const TokenService_1 = require("./TokenService");
const UserRepo_1 = require("../users/UserRepo");
const AuthRepo_1 = require("./AuthRepo");
const AuthController_1 = require("./AuthController");
// Initialize Token Blacklist
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
const { JWT_SECRET } = process.env;
const tokenBlacklist = new TokenBlacklist_1.TokenBlacklist(JWT_SECRET);
exports.tokenService = new TokenService_1.TokenService(15, 24 * 60, tokenBlacklist, JWT_SECRET);
const userRepo = new UserRepo_1.UserRepo();
const authRepo = new AuthRepo_1.AuthRepo(userRepo);
exports.authController = new AuthController_1.AuthController(exports.tokenService, authRepo);
