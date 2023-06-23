export interface IUserRepo<T> {
     findByUsername(username: string): Promise<T>
}

export class AuthRepo<T> {
     constructor(private userRepo: IUserRepo<T>) {}
     
     async getUser(username: string): Promise<T> {
          return this.userRepo.findByUsername(username);
     }
}
