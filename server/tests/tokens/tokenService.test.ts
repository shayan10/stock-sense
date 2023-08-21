import request from "supertest";
import { app } from "../../src/app";
import { userFactory } from "../factories/user";
import { UserPayload, UserResponse } from "../../src/services/users/UserSchema";
import { tokenService } from "../../src/services/authentication/auth";
import jwt from "jsonwebtoken";
import { TokenVerificationError } from "../../src/services/authentication/TokenService";
import { beforeAll, it, describe, expect } from "@jest/globals";

let userPayload: UserPayload;
let user: UserResponse;

beforeAll(async () => {
	userPayload = userFactory();
	const response = await request(app())
		.post("/users/register")
		.send(userPayload)
		.set("Accept", "application/json");
	expect(response.statusCode).toBe(200);
	user = response.body;
});

describe("Token Service", () => {
	it("Gives back access/refresh token pair", async () => {
		const tokens = await tokenService.getTokens(user.id.toString());
		expect(tokens).toEqual(
			expect.objectContaining({
				accessToken: expect.any(String),
				refreshToken: expect.any(String),
			})
		);
		const decodedAccessToken = jwt.decode(tokens.accessToken);
		expect(decodedAccessToken).toEqual(
			expect.objectContaining({
				sub: user.id.toString(),
				iat: expect.any(Number),
				exp: expect.any(Number),
			})
		);

		const decodedRefreshToken = jwt.decode(tokens.refreshToken);
		expect(decodedRefreshToken).toEqual(
			expect.objectContaining({
				sub: user.id.toString(),
				iat: expect.any(Number),
				exp: expect.any(Number),
			})
		);
	});
});

describe("Token Verification", () => {
	it("Throws JsonWebTokenError for invalid jwt", async () => {
		try {
			await tokenService.verifyAccessToken("helloWorld");
		} catch (error) {
			expect(error).toEqual(TokenVerificationError);
		}
	});

	it("Throws JsonWebTokenError for access token", async () => {
		try {
			const tokens = await tokenService.getTokens(user.id.toString());
			const invalidToken = tokens.accessToken + "x";
			await tokenService.verifyAccessToken(invalidToken);
		} catch (error) {
			expect(error).toEqual(TokenVerificationError);
		}
	});

	it("Throws TokenVerificationError for jwt with sub", async () => {
		try {
			const currTime = Math.floor(Date.now() / 1000);

			const payload: jwt.JwtPayload = {
				iat: currTime,
				exp: currTime + 100 * 60,
			};

			if (!process.env.JWT_SECRET) {
				expect(false).toBe(true);
				return;
			}

			const token = jwt.sign(payload, process.env.JWT_SECRET);
			await tokenService.verifyRefreshToken(token);
		} catch (error) {
			expect(error).toEqual(TokenVerificationError);
		}
	});
});

describe("Token Refresh", () => {
	it("Invalidates previous access and refresh tokens", async () => {
		const originalTokens = await tokenService.getTokens(
			user.id.toString()
		);
		// Get refresh tokens
		await tokenService.refresh(originalTokens.refreshToken);

		try {
			await tokenService.verifyAccessToken(originalTokens.accessToken);
		} catch (error) {
			expect(error).toEqual(TokenVerificationError);
		}

		try {
			await tokenService.verifyRefreshToken(
				originalTokens.refreshToken
			);
		} catch (error) {
			expect(error).toEqual(TokenVerificationError);
		}
	});

	it("Does not refresh with invalid refresh token", async () => {
		const tokens = tokenService.getTokens(user.id.toString());

		try {
			await tokenService.refresh(tokens.accessToken);
		} catch (error) {
			expect(error).toEqual(TokenVerificationError);
		}
	});
});
