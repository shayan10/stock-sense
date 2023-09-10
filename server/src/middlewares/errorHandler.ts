import { NextFunction, Request, Response } from "express";
import { BaseError } from "../errors/customError";
import { z } from "zod";

export const errorHandler = (
	error: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (error instanceof BaseError) {
		res.status(error.status_code).send({
			error_code: error.error_code,
			error_description: error.error_description,
		});
	} else if (error instanceof z.ZodError) {
		res.status(400).send(error.flatten().fieldErrors);
	} else {
		res.status(500).send({ message: "Please try again later" });
	}
};