export interface CreateWebhookRequest {

	callbackUrl: string
	enabled?: boolean
	events: string[]
	name: string
	version: number
	scopeObjectId: number
	scope: string
	subscope?: {
		columnIds: string[]
	}
}
