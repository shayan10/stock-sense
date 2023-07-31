import * as jwt from "jsonwebtoken";
import { TokenPair } from "./AuthController";
import { TokenBlacklist } from "./TokenBlacklist";
import { createHash } from "crypto";

export type TokenType = "access" | "refresh";

export class TokenVerificationError extends Error {
	constructor(public override message: string) {
		super();
	}
}

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
		const currTime = Math.floor(Date.now() / 1000);

		const payload: jwt.JwtPayload = {
			sub: userId,
			iat: currTime,
			exp: currTime + expiryMin * 60,
			aud: createHash("sha256")
				.update(`${currTime}+${type}`)
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
				throw new TokenVerificationError("Invalid Token");
			}

			// Verify token type
			if (
				decodedToken["aud"] !=
				createHash("sha256")
					.update(`${decodedToken["iat"]}+${type}`)
					.digest("hex")
			) {
				throw new TokenVerificationError("Invalid Token Type");
			}
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				throw new jwt.JsonWebTokenError("Invalid JWT");
			}
			throw error;
		}

		try {
			// Validate token
			const isValidToken =
				token &&
				(await this.tokenBlacklist.validateToken(type, token));

			if (!isValidToken) {
				throw new TokenVerificationError("Invalid Token");
			}

			return decodedToken.sub as string;
		} catch (error) {
			throw new TokenVerificationError("Invalid Token");
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
				throw new TokenVerificationError("Token does not exist");
			}

			// Add to blacklist
			this.tokenBlacklist.revokeToken("access", accessToken);
			this.tokenBlacklist.revokeToken("refresh", refreshToken);

			// Remove from DB
			this.tokenBlacklist.removeTokenPair(refreshToken);
		} catch (error) {
			throw new TokenVerificationError("Invalid Token");
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
