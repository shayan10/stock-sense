"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepo = void 0;
class AuthRepo {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async getUser(username) {
        return this.userRepo.findByUsername(username);
    }
}
exports.AuthRepo = AuthRepo;
