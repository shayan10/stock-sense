import { db } from "../../db/Postgres";
import { UserPayload, UserUpdatePayload } from "./UserSchema";
import { BaseError } from "../../errors/customError";

export const UserNotFoundError = (username?: string) => {
	const message = username
		? `No user found with username ${username}`
		: "No user found";
	return new BaseError(
		message,
		"user_not_found",
		"You have entered an invalid username or password",
		400
	);
};

export class UserRepo {
	constructor() {}

	async find(id: number) {
		const user = await db
			.selectFrom("users")
			.select(["id", "username", "first_name", "last_name"])
			.where("id", "=", id)
			.executeTakeFirstOrThrow((value) => {
				return UserNotFoundError();
			});
		return user;
	}

	async findByUsername(username: string) {
		const user = db
			.selectFrom("users")
			.where("username", "=", username)
			.selectAll()
			.executeTakeFirstOrThrow((error) => UserNotFoundError());
		return user;
	}

	async insert(userInfo: UserPayload) {
		const user = await db
			.insertInto("users")
			.values(userInfo)
			.returning(["id", "username", "first_name", "last_name"])
			.executeTakeFirst()
			.catch((error) => console.log(error));
		return user;
	}

	async update(id: number, userInfo: UserUpdatePayload): Promise<void> {
		await db
			.updateTable("users")
			.set(userInfo)
			.where("id", "=", id)
			.executeTakeFirstOrThrow((error) => UserNotFoundError());
	}

	async usernameTaken(username: string) {
		const usernameTaken =
			(
				await db
					.selectFrom("users")
					.where("username", "=", username)
					.execute()
			).length != 0;
		return usernameTaken;
	}
}

export const userRepo: UserRepo = new UserRepo();
