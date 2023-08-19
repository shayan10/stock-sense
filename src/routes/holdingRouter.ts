import { NextFunction, Request, Response, Router } from "express";
import { holdingService } from "../services/holdings/HoldingService";
import { param, validationResult } from "express-validator";

const router = Router();

router.get(
	"/positions",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { user_id } = req.body;
			const positions = await holdingService.retrievePositions(
				parseInt(user_id)
			);

			res.status(200).send(positions);
		} catch (error) {
			next(error);
		}
	}
);

router.get(
	"/:holding_id",
	[
		param("holding_id")
			.isNumeric()
			.withMessage("Holding ID must be an integer"),
	],
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatorResult = validationResult(req);

			if (!validatorResult.isEmpty()) {
				res.status(400).send(validatorResult.array());
				return;
			}

			const { user_id } = req.body;
			const { holding_id } = req.params;

			const holdingDetails = await holdingService.positionDetail(
				parseInt(user_id),
				parseInt(holding_id)
			);

			const news = await holdingService.positionNews(
				holdingDetails.ticker_symbol
			);
			res.status(200).send({
				...holdingDetails,
				news,
			});
		} catch (error) {
			next(error);
		}
	}
);

export default router;
