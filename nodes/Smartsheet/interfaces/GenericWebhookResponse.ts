import {GenericError} from "./GenericError";
import {ListedWebhook} from "./ListWebhookResponse";

export interface GenericWebhookResponse {

	version: number
	failedItems: [
		{
			rowId: number
			error: GenericError,
			index: number
		}
	],
	message: string
	resultCode: number
	result: ListedWebhook
}
