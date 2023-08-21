import request from "supertest";
import { app } from "../src/app";
import { userFactory } from "./factories/user";
import { it, describe, expect } from "@jest/globals";

describe("POST /users/register", () => {
	it("returns 200 for properly created user", async () => {
		const userPayload = userFactory();

		const response = await request(app())
			.post("/users/register")
			.send(userPayload)
			.set("Accept", "application/json");

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual(
			expect.objectContaining({
				id: expect.any(Number),
				first_name: userPayload.first_name,
				last_name: userPayload.last_name,
				username: userPayload.username,
			})
		);
	});

	it("returns 400 for invalid data type", async () => {
		const userPayload = userFactory();

		const response = await request(app())
			.post("/users/register")
			.send({
				username: userPayload.username,
				first_name: 2,
				last_name: 2,
			})
			.set("Accept", "application/json");

		expect(response.statusCode).toBe(400);
	});

	it("returns 400 for incomplete payload", async () => {
		const userPayload = userFactory();

		const response = await request(app())
			.post("/users/register")
			.send({
				username: userPayload.username,
				first_name: 2,
			})
			.set("Accept", "application/json");

		expect(response.statusCode).toBe(400);
	});

	it("returns 400 for reregistering user with same username", async () => {
		const user1 = userFactory();
		const response1 = await request(app())
			.post("/users/register")
			.send(user1)
			.set("Accept", "application/json");

		expect(response1.statusCode).toBe(200);
		const user2 = userFactory();
		user2.username = user1.username;
		const response2 = await request(app())
			.post("/users/register")
			.send(user2)
			.set("Accept", "application/json");
		expect(response2.statusCode).toBe(400);
	});
});
