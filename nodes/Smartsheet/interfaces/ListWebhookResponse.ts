import {PagedResponse} from "./PagedResponse";

export interface ListWebhookResponse extends PagedResponse<ListedWebhook> {}

export interface ListedWebhook {

	callbackUrl: string
	enabled: boolean
	events: string[],
	name: string
	version: number
	id: number
	apiClientId: number
	scopeObjectId: number
	apiClientName: string
	createdAt: Date,
	disabledDetails: string
	modifiedAt: Date
	scope: string
	sharedSecret: string
	stats: {
		lastCallbackAttempt: Date
		lastcallbackAttemptRetryCount: number
		lastSuccessfulCallback: Date
	}
	status: string,
	subscope: {
		columnIds: string[]
	}
}
