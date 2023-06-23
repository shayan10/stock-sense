"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.AuthenticationError = void 0;
const bcrypt_1 = require("bcrypt");
class AuthenticationError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthController {
    constructor(tokenService, authRepo) {
        this.tokenService = tokenService;
        this.authRepo = authRepo;
    }
    async authenticate(username, password_plaintext) {
        // Fetch user from the auth repo
        const user = await this.authRepo.getUser(username);
        // Compare user password
        const validPassword = await (0, bcrypt_1.compare)(password_plaintext, user.password);
        if (!validPassword) {
            throw new AuthenticationError("Invalid Credentials");
        }
        // Generate tokens
        const tokens = this.tokenService.getTokens(user.id.toString());
        return tokens;
    }
    async refresh(refreshToken) {
        return this.tokenService.refresh(refreshToken);
    }
    async logout(accessToken, refreshToken) {
        // Revoking access and coressponding refresh token
        this.tokenService.revokeToken(refreshToken);
    }
}
exports.AuthController = AuthController;
