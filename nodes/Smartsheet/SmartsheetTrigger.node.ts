import {
	INodeType,
	INodeTypeDescription, INodePropertyOptions, ILoadOptionsFunctions, IHookFunctions
} from "n8n-workflow";
import {
	createWebhook,
	deleteWebhook,
	listSheets,
	listWebhooks,
	updateWebhook
} from "./SmartsheetApi";
import {IWebhookFunctions, IWebhookResponseData} from "n8n-workflow/dist/Interfaces";
import {isError} from "./interfaces/GenericError";
import {CreateWebhookRequest} from "./interfaces/CreateWebhookRequest";

export class SmartsheetTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Smartsheet Trigger",
		name: "smartsheetTrigger",
		icon: "file:smartsheet.svg",
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when Smartsheet events occur',
		defaults: {
			name: 'Smartsheet Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'smartsheetApi',
				required: true
			}
		],
		webhooks: [
			// Creates a Webhook for this node with a path of /default
			// that will call webhook() when triggered
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook'
			}
		],
		properties: [
			{
				displayName: 'Type',
				name: 'webhookType',
				type: 'options',
				options: [
					{
						name: 'Sheet',
						value: 'sheet',
					},
				],
				default: 'sheet',
				required: true,
			},
			{
				displayName: 'Sheet Name or ID',
				name: "sheetId",
				type: "options",
				description: 'Choose from the list of available Sheets. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				// Only show if the webhookType value defined above is 'sheet'
				displayOptions: {
					show: {
						webhookType: ['sheet']
					}
				},
				// Get our values from the options method 'getSheets'
				typeOptions: {
					loadOptionsMethod: 'getSheets',
				},
				default: '',
				required: true
			}
		]
	};

	methods = {
		loadOptions: {
			async getSheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const sheets = await listSheets.call(this)
				if (isError(sheets)) {
					return []
				}

				return sheets.data.map((sheet) => {
					return {name: sheet.name, value: sheet.id}
				})
			}
		}
	}

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhooks = await listWebhooks.call(this)
				if (isError(webhooks)) {
					return false
				}

				const webhookUrl = this.getNodeWebhookUrl("default")
				for (const webhook of webhooks.data) {
					if (webhook.callbackUrl == webhookUrl) {
						const webhookData = this.getWorkflowStaticData('node');
						webhookData.webhookId = webhook.id;
						return true;
					}
				}
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				if (webhookUrl === undefined || webhookUrl === null) {
					return false
				}

				const sheetId = this.getNodeParameter('sheetId')
				if (sheetId === undefined || sheetId === null) {
					return false
				}

				const body: CreateWebhookRequest = {
					name: `n8n - Webhook [Sheet ID: ${sheetId}]`,
					callbackUrl: webhookUrl,
					events: ['*.*'],
					version: 1,
					scopeObjectId: parseInt(sheetId.toString()),
					scope: 'sheet',
				};

				const responseData = await createWebhook.call(this, body)
				if (isError(responseData)) {
					return false
				}

				if (responseData.message !== "SUCCESS") {
					return false
				}

				const updateResponseData = await updateWebhook.call(this, responseData.result.id, {enabled: true})
				if (isError(updateResponseData)) {
					return false
				}

				if (updateResponseData.message !== "SUCCESS") {
					return false
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = responseData.result.id;
				return true;
			},
			async delete(this: IHookFunctions) {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId
				if (webhookId === undefined || webhookId === null) {
					return false
				}

				const response = await deleteWebhook.call(this, parseInt(webhookId.toString()))
				if (isError(response)) {
					return false
				}

				if (response.message !== "SUCCESS") {
					return false
				}

				delete webhookData.webhookId;

				return true;
			},
		}
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const headers = this.getHeaderData();
		let response = req.body;
		if (response.challenge) {
			const challenge = headers['smartsheet-hook-challenge'];
			const webhookResponse = JSON.stringify({smartsheetHookResponse: challenge});
			return {
				webhookResponse,
			};
		}

		return {
			workflowData: [this.helpers.returnJsonArray(response)],
		};
	}
}
