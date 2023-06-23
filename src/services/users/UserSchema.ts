import { User } from "./User";
import { hash } from "bcrypt";

import {z} from 'zod';
import { customMap } from "../../utiils";

z.setErrorMap(customMap);

// NOTE: Accepts falsy value for validation
const usernameSchema = z.string().max(20).refine(async (val) => {
     const userNameTaken = await User.validateUsername(val);
     return !userNameTaken;
}, {
     message: "Username has been taken"
});

const passwordSchema = z.string().max(20).transform(async (value: string) => {
     return await hash(value, 10);
});

const userUpdateProps =  {
     username: usernameSchema,
     first_name: z.string().max(25),
     last_name: z.string().max(25)
}

export const userUpdateSchema = z.object(userUpdateProps).partial();

export const userSchema = z.object({
     ...userUpdateProps,
     password: passwordSchema
}).strip();


export type UserPayload = z.infer<typeof userSchema>
export type UserUpdatePayload = z.infer<typeof userUpdateSchema>
export type UserResponse = {id: number, username: string, first_name: string, last_name: string}
