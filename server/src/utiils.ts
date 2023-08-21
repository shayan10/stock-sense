import { z } from "zod";
import { BaseError } from "./errors/customError";

export const customMap: z.ZodErrorMap = (issue, ctx) => {
	if (issue.code === z.ZodIssueCode.too_big) {
		return {
			message: `${issue.path[0]} can only be ${issue.maximum} characters long`,
		};
	}

	if (issue.code == z.ZodIssueCode.invalid_type) {
		return {
			message: `${issue.path[0]} can only be a ${issue.expected}`,
		};
	}

	return { message: ctx.defaultError };
};

export const NoArgumentsProvidedException = customError();

export const validate = async <T extends z.ZodTypeAny>(
	schema: T,
	data: {}
): Promise<z.infer<T>> => {
	try {
		const value = await schema.parseAsync(data);
		if (Object.keys(value).length === 0) {
			throw new BaseError(
				"No arguments provided",
				"no_arg_provided",
				"No arguments were given in the request payload",
				400
			);
		}
		return value;
	} catch (error) {
		throw error;
	}
};

export function customError() {
	return class extends Error {
		constructor(message: string) {
			super(message);
		}
	};
}
