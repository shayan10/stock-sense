import {UserRepo} from './UserRepo';
import { UserPayload, UserResponse, UserUpdatePayload } from './UserSchema';

export class UserNotFound extends Error {
     constructor(public override message: string) {
          super();
     }
}

export class User {
     private static userRepo = new UserRepo();

     static async validateUsername(username: string): Promise<boolean> {
          return this.userRepo.isUsernameTaken(username);
     }

     static async insert(userInfo: UserPayload): Promise<void | UserResponse> {
          return this.userRepo.insert(userInfo);
     }

     static async get(id: number): Promise<UserResponse> {
          return this.userRepo.find(id); 
     }

     static async update(id: number, userInfo: UserUpdatePayload): Promise<undefined | UserResponse> {
          return this.userRepo.update(id, userInfo);
     }
};
