export class BaseError extends Error {
	public error_code: string;
	public error_description: string;
	public status_code: number;

	constructor(
		message: string,
		error_code: string,
		error_description: string,
		status_code: number
	) {
		super(message);
		this.error_code = error_code;
		this.error_description = error_description;
		this.status_code = status_code;
	}
}
