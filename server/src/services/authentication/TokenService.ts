import * as jwt from "jsonwebtoken";
import { TokenPair } from "./AuthController";
import { TokenBlacklist } from "./TokenBlacklist";
import { createHash } from "crypto";
import { DateTime } from "luxon";
import { BaseError } from "../../errors/customError";

export type TokenType = "access" | "refresh";

export const TokenVerificationError = new BaseError(
	"This token is not valid",
	"invalid_token",
	"This token is no longer valid",
	401
);

export const TokenExpiredError = new BaseError(
	"This token has expired",
	"expired_token",
	"This token is no longer valid",
	401
);

export class TokenService {
	constructor(
		private access_token_length: number,
		private refresh_token_length: number,
		private tokenBlacklist: TokenBlacklist,
		private JWT_SECRET: string
	) {}

	private generateToken(
		userId: string,
		expiryMin: number,
		type: TokenType,
		options: object = {}
	): string {
		const currDate = DateTime.now();
		const expDate = currDate.plus({ minutes: expiryMin });

		const payload: jwt.JwtPayload = {
			sub: userId,
			iat: currDate.toUnixInteger(),
			exp: expDate.toUnixInteger(),
			aud: createHash("sha256")
				.update(`${currDate.toUnixInteger()}+${type}`)
				.digest("hex"),
			...options,
		};

		return jwt.sign(payload, this.JWT_SECRET);
	}

	private async verifyToken(
		type: TokenType,
		token: string
	): Promise<string> {
		let decodedToken: jwt.JwtPayload;
		try {
			decodedToken = jwt.verify(token, this.JWT_SECRET, {
				ignoreExpiration: false,
				ignoreNotBefore: false,
				allowInvalidAsymmetricKeyTypes: false,
			}) as jwt.JwtPayload;

			if (
				!decodedToken["sub"] ||
				!decodedToken["iat"] ||
				!decodedToken["exp"] ||
				!decodedToken["aud"]
			) {
				throw TokenVerificationError;
			}

			// Verify token type
			if (
				decodedToken["aud"] !=
				createHash("sha256")
					.update(`${decodedToken["iat"]}+${type}`)
					.digest("hex")
			) {
				throw TokenVerificationError;
			}
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError)
				throw TokenExpiredError;

			throw TokenVerificationError;
		}

		try {
			// Validate token
			const isValidToken =
				token &&
				(await this.tokenBlacklist.validateToken(type, token));

			if (!isValidToken) {
				throw TokenVerificationError;
			}

			return decodedToken.sub as string;
		} catch (error) {
			throw TokenVerificationError;
		}
	}

	public async refresh(refreshToken: string): Promise<TokenPair> {
		try {
			// Verify existing refresh token
			const userId = await this.verifyRefreshToken(refreshToken);
			// Revoke existing tokens
			await this.revokeToken(refreshToken);
			// Get new tokens
			const tokens = this.getTokens(userId);
			return tokens;
		} catch (error) {
			throw error;
		}
	}

	public async revokeToken(refreshToken: string): Promise<void> {
		try {
			const accessToken = await this.tokenBlacklist.getAccessToken(
				refreshToken
			);

			if (!accessToken) {
				throw TokenVerificationError;
			}

			// Add to blacklist
			await this.tokenBlacklist.revokeToken("access", accessToken);
			await this.tokenBlacklist.revokeToken("refresh", refreshToken);

			// Remove from DB
			this.tokenBlacklist.removeTokenPair(refreshToken);
		} catch (error) {
			throw TokenVerificationError;
		}
	}

	public getTokens(userId: string): TokenPair {
		const accessToken = this.generateToken(
			userId,
			this.access_token_length,
			"access"
		);
		const refreshToken = this.generateToken(
			userId,
			this.refresh_token_length,
			"refresh"
		);

		// Commit to database
		this.tokenBlacklist.saveTokenPair(accessToken, refreshToken, userId);

		return { accessToken, refreshToken };
	}

	public async verifyAccessToken(token: string): Promise<string> {
		return this.verifyToken("access", token);
	}

	public async verifyRefreshToken(token: string): Promise<string> {
		return this.verifyToken("refresh", token);
	}
}
