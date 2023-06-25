import { z } from "zod";
import { customMap } from "../../utiils";

z.setErrorMap(customMap);

const accountProps = {
	plaid_account_id: z.string(),
	account_name: z.string(),
};

const accountSchema = z.object({
	...accountProps,
});

export type AccountPayload = z.infer<typeof accountSchema>;
