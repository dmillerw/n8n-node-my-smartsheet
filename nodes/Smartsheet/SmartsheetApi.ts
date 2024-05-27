import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	NodeApiError
} from 'n8n-workflow';
import {GenericError} from "./interfaces/GenericError";
import {ListSheetResponse} from "./interfaces/ListSheetResponse";
import {ListWebhookResponse} from "./interfaces/ListWebhookResponse";
import {CreateWebhookRequest} from "./interfaces/CreateWebhookRequest";
import {GenericWebhookResponse} from "./interfaces/GenericWebhookResponse";
import {UpdateWebhookRequest} from "./interfaces/UpdateWebhookRequest";
import {ListColumnsResponse} from "./interfaces/ListColumnsResponse";
import {AddedRow} from "./interfaces/AddRowRequest";
import Sheet from "./interfaces/temp/Sheet";
import Row from "./interfaces/temp/Row";
import {UpdatedRow} from "./interfaces/UpdateRowRequest";

export type ThisType = IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions

const defaultOptions = {
	changeAgent: "N8N"
}

async function smartsheetClient(this: ThisType) {
	const credentials = await this.getCredentials("smartsheetApi")
	const apiKey = credentials.apiKey.toString()
	const client = require('smartsheet');
	return client.createClient({
		accessToken: apiKey,
		logLevel: 'info',
		changeAgent: "N8N"
	})
}

export async function listColumns(this: ThisType, sheetId: number): Promise<ListColumnsResponse | GenericError> {
	const client = await smartsheetClient.call(this)
	return await client.sheets.getColumns({sheetId: sheetId, ...defaultOptions})
}

export async function listSheets(this: ThisType): Promise<ListSheetResponse | GenericError> {
	const client = await smartsheetClient.call(this)
	return await client.sheets.listSheets({queryParameters: {includeAll: true}, ...defaultOptions})
}

export async function getSheet(this: ThisType, sheetId: number): Promise<Sheet | GenericError> {
	const client = await smartsheetClient.call(this)
	return await client.sheets.getSheet({id: sheetId, ...defaultOptions})
}

export async function getRow(this: ThisType, sheetId: number, rowId: number): Promise<Row | GenericError> {
	const client = await smartsheetClient.call(this)
	return await client.sheets.getRow({sheetId: sheetId, rowId: rowId, ...defaultOptions})
}

export async function addRow(this: ThisType, sheetId: number, row: AddedRow): Promise<any> {
	const client = await smartsheetClient.call(this)
	return await client.sheets.addRows({sheetId: sheetId, body: [row], ...defaultOptions})
}

export async function updateRow(this: ThisType, sheetId: number, row: UpdatedRow): Promise<any> {
	const client = await smartsheetClient.call(this)
	return await client.sheets.updateRow({sheetId: sheetId, body: row, ...defaultOptions})
}

export async function listWebhooks(this: ThisType): Promise<ListWebhookResponse | GenericError> {
	const client = await smartsheetClient.call(this)
	return await client.webhooks.listWebhooks({queryParameters: {includeAll: true}, ...defaultOptions})
}

export async function createWebhook(this: ThisType, request: CreateWebhookRequest): Promise<GenericWebhookResponse | GenericError> {
	const client = await smartsheetClient.call(this)
	return client.webhooks.createWebhook({body: request, ...defaultOptions})
}

export async function updateWebhook(this: ThisType, webhookId: number, request: UpdateWebhookRequest): Promise<GenericWebhookResponse | GenericError> {
	const client = await smartsheetClient.call(this)
	return client.webhooks.updateWebhook({webhookId: webhookId, body: request, ...defaultOptions})
}

export async function deleteWebhook(this: ThisType, webhookId: number): Promise<GenericWebhookResponse | GenericError> {
	const client = await smartsheetClient.call(this)
	return client.webhooks.deleteWebhook({webhookId: webhookId, ...defaultOptions})
}

export async function smartsheetApiRequest(this: ThisType, method: string, path: string, body?: any, qs?: any, _option?: {}): Promise<any> {
	const credentials = await this.getCredentials("smartsheetApi")
	const options = {
		method,
		body,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${credentials.apiKey}`,
		},
		qs,
		uri: `https://api.smartsheet.com/2.0${path}`,
		json: true,
		resolveWithFullResponse: true,
	};

	try {
		const response = await this.helpers.request.call(this, options);
		return response.body;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
