import { redisClient } from "../../db/Redis";
import { TokenType, TokenVerificationError } from "./TokenService";
import { db } from "../../db/Postgres";
import { DateTime } from "luxon";

import * as jwt from "jsonwebtoken";

export class TokenBlacklist {
	constructor(private JWT_SECRET: string) {}
	async validateToken(type: TokenType, token: string): Promise<boolean> {
		return (await redisClient.exists(`${type}-blacklist:${token}`)) !== 1;
	}

	async revokeToken(type: TokenType, token: string): Promise<void> {
		try {
			const decodedToken = jwt.verify(token, this.JWT_SECRET, {
				ignoreNotBefore: false,
				allowInvalidAsymmetricKeyTypes: false,
				ignoreExpiration: true,
			}) as jwt.JwtPayload;

			if (!decodedToken.exp) {
				return;
			}

			const expTime =
				decodedToken.exp > DateTime.now().toUnixInteger()
					? decodedToken.exp
					: 0;

			if (expTime == 0) {
				return;
			}

			await redisClient.set(
				`${type}-blacklist:${token}`,
				token,
				"PXAT",
				expTime
			);
		} catch (error) {
			console.log(error);
			throw new TokenVerificationError("Invalid Token");
		}
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
