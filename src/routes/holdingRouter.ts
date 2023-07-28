import { Request, Response, Router } from "express";
import { holdingService } from "../services/holdings/HoldingService";
import { param } from "express-validator";

const router = Router();

router.get("/positions", async (req: Request, res: Response) => {
	const { user_id } = req.body;
	try {
		const positions = await holdingService.retrievePositions(
			parseInt(user_id)
		);

		res.status(200).send(positions);
	} catch (error) {
		console.log(error);
		res.status(400).send({ message: "Could not retrieve holdings" });
	}
});

router.get(
	"/:holding_id",
	[
		param("holding_id")
			.isNumeric()
			.withMessage("Holding ID must be an integer"),
	],
	async (req: Request, res: Response) => {
		const { user_id } = req.body;
		const { holding_id } = req.params;

		try {
			const holdingDetails = await holdingService.positionDetail(
				parseInt(user_id),
				parseInt(holding_id)
			);

			if (!holdingDetails) {
				res.status(404).send({
					message: "Holding not found",
				});
				return;
			}

			const news = await holdingService.positionNews(
				holdingDetails.ticker_symbol
			);
			res.status(200).send({
				...holdingDetails,
				news,
			});
		} catch (error) {
			console.log(error);
			res.status(400).send({
				message: "Unable to retrieve holding details",
			});
		}
	}
);

export default router;
