"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserNotFound = void 0;
const UserRepo_1 = require("./UserRepo");
class UserNotFound extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
}
exports.UserNotFound = UserNotFound;
class User {
    static async isUsernameTaken(username) {
        return this.userRepo.isUsernameTaken(username);
    }
    static async insert(userInfo) {
        return this.userRepo.insert(userInfo);
    }
    static async get(id) {
        return this.userRepo.find(id);
    }
    static async update(id, userInfo) {
        return this.userRepo.update(id, userInfo);
    }
}
exports.User = User;
User.userRepo = new UserRepo_1.UserRepo();
;
