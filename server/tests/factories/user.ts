import { faker } from "@faker-js/faker";
import { UserPayload } from "../../src/services/users/UserSchema";

export const userFactory = (): UserPayload => {
	return {
		password: faker.internet.password({ length: 20 }),
		username: faker.internet.userName(),
		first_name: faker.person.firstName(),
		last_name: faker.person.lastName(),
	};
};
