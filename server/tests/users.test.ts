import request from "supertest";
import { app } from "../src/app";
import { userFactory } from "./factories/user";
import { UserPayload } from "../src/services/users/UserSchema";
import { redisConnect } from "../src/db/Redis";
import { connect } from "../src/db/Postgres";
import { beforeAll, it, describe, expect } from "@jest/globals";

beforeAll(async () => {
	try {
		redisConnect();
		connect();	
	} catch (error) {
		throw error;
	}
})

describe("GET /users/", () => {
	it("returns 401 for request without token", async () => {
		const response = await request(app()).get("/users/");
		expect(response.statusCode).toBe(401);
	});

	it("returns 200 and user info with auth token", async () => {
		const user = userFactory();
		// First register user
		const response = await request(app())
			.post("/users/register")
			.send(user)
			.set("Accept", "application/json");
		expect(response.statusCode).toBe(200);

		// Login with credentials
		const loginResponse = await request(app()).post("/auth/login").send({
			username: user.username,
			password: user.password,
		});
		expect(loginResponse.statusCode).toBe(200);
		expect(loginResponse.body).toEqual(
			expect.objectContaining({
				accessToken: expect.any(String),
			})
		);

		const userFetch = await request(app())
			.get("/users/")
			.set("Authorization", `${loginResponse.body.accessToken}`);

		expect(userFetch.statusCode).toBe(200);
		expect(userFetch.body).toEqual(
			expect.objectContaining({
				id: expect.any(Number),
				username: user.username,
				first_name: user.first_name,
				last_name: user.last_name,
			})
		);
	});
});

describe("PATCH /users/", () => {
	let user: UserPayload, accessToken: string;
	beforeAll(async () => {
		user = userFactory();
		const response = await request(app())
			.post("/users/register")
			.send(user)
			.set("Accept", "application/json");
		expect(response.statusCode).toBe(200);

		const loginResponse = await request(app()).post("/auth/login").send({
			username: user.username,
			password: user.password,
		});

		accessToken = loginResponse.body.accessToken;
	});

	it("returns 400 for invalid payload", async () => {
		const response = await request(app())
			.patch("/users/")
			.set("Authorization", `${accessToken}`)
			.send({
				hello: "world",
			});
		expect(response.statusCode).toBe(400);
	});
});
