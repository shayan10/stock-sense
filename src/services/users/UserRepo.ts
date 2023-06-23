import { db } from "../../db/Postgres";
import { UserNotFound } from "./User";
import { UserResponse } from "./UserSchema";
import { UserPayload, UserUpdatePayload } from "./UserSchema";

export class UserRepo {
     async find(id: number) {
          const user = await db.selectFrom("users").select(["id","username", "first_name",
               "last_name"]).where("id", '==',id).executeTakeFirstOrThrow((value) => {
                    return new UserNotFound("User Not Found");
               });
          return user;
     }

     async findByUsername(username: string) {
          const user = db.selectFrom("users").where("username", "=", username).selectAll()
               .executeTakeFirstOrThrow((error) => new UserNotFound("Invalid username"));
          return user;
     }

     async insert(userInfo: UserPayload) {
          const user = await db.insertInto("users").values(userInfo).returning(["id", "username",
               "first_name", "last_name"]).executeTakeFirst().catch(error => console.log(error));
          return user;
     }

     async update(id: number, userInfo: UserUpdatePayload): Promise<undefined | UserResponse> {
          const user = await db.updateTable("users").set(userInfo).where("id", "==", id).returning([
               "id", "username", "first_name", "last_name"
          ]).executeTakeFirst();
          return user;
     }

     async isUsernameTaken(username: string) {
          const usernameTaken = (await db.selectFrom("users").where("username", "=", username).execute()).length != 0;
          return usernameTaken;
     }
};
