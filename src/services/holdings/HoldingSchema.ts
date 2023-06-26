import { z } from "zod";

const holdingProps = {
	account_id: z.number(),
	ticker_symbol: z.string(),
	quantity: z.number(),
	cost_basis: z.number(),
};

const holdingSchema = z.object(holdingProps);

export type HoldingPayload = z.infer<typeof holdingSchema>;
