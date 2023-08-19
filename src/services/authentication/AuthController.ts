import { UserNotFoundError } from "../users/UserRepo";
import { AuthRepo } from "./AuthRepo";
import { TokenService } from "./TokenService";
import { compare } from "bcrypt";

export type TokenPair = { accessToken: string; refreshToken: string };

interface RequiredUserProps {
	id: number;
	username: string;
	password: string;
}

export class AuthController<T extends RequiredUserProps> {
	constructor(
		private tokenService: TokenService,
		private authRepo: AuthRepo<T>
	) {}

	async authenticate(
		username: string,
		password_plaintext: string
	): Promise<TokenPair> {
		// Fetch user from the auth repo
		const user = await this.authRepo.getUser(username);
		// Compare user password
		const validPassword = await compare(
			password_plaintext,
			user.password
		);

		if (!validPassword) {
			throw UserNotFoundError();
		}

		// Generate tokens
		const tokens = this.tokenService.getTokens(user.id.toString());

		return tokens;
	}

	async refresh(refreshToken: string): Promise<TokenPair> {
		return this.tokenService.refresh(refreshToken);
	}

	async logout(accessToken: string, refreshToken: string): Promise<void> {
		// Revoking access and coressponding refresh token
		this.tokenService.revokeToken(refreshToken);
	}
}
