import { TokenBlacklist } from "./TokenBlacklist";
import { TokenService } from "./TokenService";
import { UserRepo } from "../users/UserRepo";
import { AuthRepo } from "./AuthRepo";
import { AuthController } from "./AuthController";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
}
const {JWT_SECRET} = process.env;

const tokenBlacklist = new TokenBlacklist(JWT_SECRET);
export const tokenService = new TokenService(15, 24*60, tokenBlacklist, JWT_SECRET);

const userRepo = new UserRepo();
const authRepo = new AuthRepo(userRepo);

export const authController = new AuthController(tokenService, authRepo)