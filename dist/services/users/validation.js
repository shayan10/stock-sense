"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = exports.userUpdateSchema = void 0;
const User_1 = require("./User");
const bcrypt_1 = require("bcrypt");
const zod_1 = require("zod");
const utiils_1 = require("../../utiils");
zod_1.z.setErrorMap(utiils_1.customMap);
// NOTE: Accepts falsy value for validation
const usernameSchema = zod_1.z.string().max(20).refine(async (val) => {
    const userNameTaken = await User_1.User.checkUsername(val);
    return !userNameTaken;
}, {
    message: "Username has been taken"
});
const passwordSchema = zod_1.z.string().max(20).transform(async (value) => {
    return await (0, bcrypt_1.hash)(value, 10);
});
const userUpdateProps = {
    username: usernameSchema,
    first_name: zod_1.z.string().max(25),
    last_name: zod_1.z.string().max(25)
};
exports.userUpdateSchema = zod_1.z.object(userUpdateProps).partial();
exports.userSchema = zod_1.z.object(Object.assign(Object.assign({}, userUpdateProps), { password: passwordSchema })).strip();
