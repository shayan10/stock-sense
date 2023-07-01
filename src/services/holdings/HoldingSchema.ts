import { z } from "zod";

const holdingProps = {
	account_id: z.number(),
	plaid_account_id: z.string(),
	ticker_symbol: z.string(),
	quantity: z.number(),
	cost_basis: z.number(),
};

const holdingPublicSchema = z.object(holdingProps);

export type HoldingPayload = z.infer<typeof holdingPublicSchema>;
