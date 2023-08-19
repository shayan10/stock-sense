import { userRepo } from "./UserRepo";
import { UserPayload, UserResponse, UserUpdatePayload } from "./UserSchema";

export interface IUserRepo {
	usernameTaken(arg: string): Promise<boolean>;
	insert(payload: UserPayload): Promise<void | UserResponse>;
	find(id: number): Promise<UserResponse>;
	update(id: number, userInfo: UserUpdatePayload): Promise<void>;
}

export class User {
	constructor(private userRepo: IUserRepo) {}

	async isUsernameTaken(username: string): Promise<boolean> {
		return this.userRepo.usernameTaken(username);
	}

	async insert(userInfo: UserPayload): Promise<void | UserResponse> {
		return this.userRepo.insert(userInfo);
	}

	async get(id: number): Promise<UserResponse> {
		return this.userRepo.find(id);
	}

	async update(id: number, userInfo: UserUpdatePayload): Promise<void> {
		return this.userRepo.update(id, userInfo);
	}
}

export const user: User = new User(userRepo);
