import * as jwt from "jsonwebtoken";
import { TokenPair } from "./AuthController";
import { TokenBlacklist } from "./TokenBlacklist";

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
		options: object = {}
	): string {
		const currTime = Math.floor(Date.now() / 1000);

		const payload: jwt.JwtPayload = {
			sub: userId,
			iat: currTime,
			exp: currTime + expiryMin * 60,
			...options,
		};

		return jwt.sign(payload, this.JWT_SECRET);
	}

	private async verifyToken(
		type: TokenType,
		token: string
	): Promise<string> {
		try {
			const decodedToken = jwt.verify(token, this.JWT_SECRET, {
				ignoreExpiration: false,
			});

			// Validate token
			const isValidToken = await this.tokenBlacklist.validateToken(
				type,
				token
			);

			if (!isValidToken || !decodedToken["sub"]) {
				throw new TokenVerificationError("Invalid Token");
			}

			return decodedToken.sub as string;
		} catch (error) {
			console.log(error);
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
			console.log(error);
			throw new TokenVerificationError("Invalid Token");
		}
	}

	public getTokens(userId: string): TokenPair {
		const accessToken = this.generateToken(
			userId,
			this.access_token_length
		);
		const refreshToken = this.generateToken(
			userId,
			this.refresh_token_length
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
