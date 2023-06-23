"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const UserRepo_1 = require("./UserRepo");
class User {
    static async validateUsername(username) {
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
User.userRepo = new UserRepo_1.UserRepo();
exports.User = User;
;
