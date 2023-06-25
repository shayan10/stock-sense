"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const Postgres_1 = require("../../db/Postgres");
const User_1 = require("./User");
class UserRepo {
    async find(id) {
        const user = await Postgres_1.db.selectFrom("users").select(["id", "username", "first_name",
            "last_name"]).where("id", '==', id).executeTakeFirstOrThrow((value) => {
            return new User_1.UserNotFound("User Not Found");
        });
        return user;
    }
    async findByUsername(username) {
        const user = Postgres_1.db.selectFrom("users").where("username", "=", username).selectAll()
            .executeTakeFirstOrThrow((error) => new User_1.UserNotFound("Invalid username"));
        return user;
    }
    async insert(userInfo) {
        const user = await Postgres_1.db.insertInto("users").values(userInfo).returning(["id", "username",
            "first_name", "last_name"]).executeTakeFirst().catch(error => console.log(error));
        return user;
    }
    async update(id, userInfo) {
        const user = await Postgres_1.db.updateTable("users").set(userInfo).where("id", "==", id).returning([
            "id", "username", "first_name", "last_name"
        ]).executeTakeFirst();
        return user;
    }
    async isUsernameTaken(username) {
        const usernameTaken = (await Postgres_1.db.selectFrom("users").where("username", "=", username).execute()).length != 0;
        return usernameTaken;
    }
}
exports.UserRepo = UserRepo;
;
