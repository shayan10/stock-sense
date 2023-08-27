import { z } from "zod";
import { customMap } from "../../utiils";
import { HoldingPublicResponse } from "../holdings/HoldingRepo";

z.setErrorMap(customMap);

const accountProps = {
	plaid_account_id: z.string(),
	account_name: z.string(),
};

const accountSchema = z.object({
	...accountProps,
});

export interface AccountPublicResponse {
	id: number;
	account_name: string;
	holdings: HoldingPublicResponse[];
}

export type AccountPayload = z.infer<typeof accountSchema>;
