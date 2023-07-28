import { redisClient } from "../../db/Redis";
import { TokenType } from "./TokenService";
import { db } from "../../db/Postgres";

import * as jwt from "jsonwebtoken";

export class TokenBlacklist {
	constructor(private JWT_SECRET: string) {}
	async validateToken(type: TokenType, token: string): Promise<boolean> {
		return (await redisClient.exists(`${type}-blacklist:${token}`)) !== 1;
	}

	async revokeToken(type: TokenType, token: string): Promise<void> {
		const decodedToken = jwt.verify(token, this.JWT_SECRET, {
			ignoreExpiration: false,
			ignoreNotBefore: false,
		}) as jwt.JwtPayload;

		const expTime = decodedToken.exp || 0;
		const remainingTime = expTime - Math.floor(Date.now() / 1000);
		await redisClient.set(
			`${type}-blacklist:${token}`,
			token,
			"PXAT",
			remainingTime
		);
	}

	async saveTokenPair(
		accessToken: string,
		refreshToken: string,
		userId: string
	): Promise<void> {
		await db
			.insertInto("tokens")
			.values({
				access_token: accessToken,
				refresh_token: refreshToken,
				user_id: parseInt(userId),
			})
			.execute();
	}

	async removeTokenPair(refreshToken: string): Promise<void> {
		await db
			.deleteFrom("tokens")
			.where("refresh_token", "=", refreshToken)
			.execute();
	}

	async getAccessToken(refreshToken: string): Promise<string | undefined> {
		const result = await db
			.selectFrom("tokens")
			.where("refresh_token", "=", refreshToken)
			.select("access_token")
			.executeTakeFirst();

		return result?.access_token;
	}
}
