import * as dotenv from "dotenv";

import { app, io } from "./app";
import { connect } from "./db/Postgres";
import { redisConnect } from "./db/Redis";

dotenv.config();

Promise.all([redisConnect(), connect()])
	.then(() => {
		if (!process.env.PORT) {
			throw new Error("PROCESS.ENV.PORT is undefined");
		}
		app().listen(process.env.PORT, () => {
			console.log(`Server started on port ${process.env.PORT}`);
		});
		io.listen(4040);
	})
	.catch((error) => console.log(error));
