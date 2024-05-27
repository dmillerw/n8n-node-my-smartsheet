import {
	INodeType,
	INodeTypeDescription,
	INodePropertyOptions,
	ILoadOptionsFunctions,
	IExecuteFunctions,
	INodeExecutionData
} from "n8n-workflow";
import {
	listColumns,
	listSheets,
} from "./SmartsheetApi";
import {isError} from "./interfaces/GenericError";
import {rowFields, rowOperations} from "./RowDescription";
import {rowExecutor} from "./executor/RowExecutor";
import {sheetFields, sheetOperations} from "./SheetDescription";
import {sheetExecutor} from "./executor/SheetExecutor";

export class Smartsheet implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Smartsheet",
		name: "smartsheet",
		icon: "file:smartsheet.svg",
		group: ['output'],
		version: 1,
		description: 'Perform various actions against a Smartsheet',
		defaults: {
			name: 'Smartsheet',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'smartsheetApi',
				required: true
			}
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Sheet',
						value: 'sheet',
						description: 'Creates, retrieves, updates, or deletes, the specified sheet'
					},
					{
						name: 'Row',
						value: 'row',
						description: 'Creates, retrieves, updates, or deletes, the specified row'
					}
				],
				default: 'sheet',
				required: true,
			},
			{
				displayName: 'Sheet Name or ID',
				name: "sheetId",
				type: "options",
				description: 'Choose from the list of available Sheets. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				// Only show if the webhookType value defined above is 'sheet' or 'row'
				displayOptions: {
					show: {
						resource: ['sheet', 'row']
					}
				},
				// Get our values from the options method 'getSheets'
				typeOptions: {
					loadOptionsMethod: 'getSheets',
				},
				default: '',
				required: true
			},

			...rowOperations,
			...rowFields,

			...sheetOperations,
			...sheetFields
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
			},

			async getColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const sheetId = this.getNodeParameter('sheetId')
				if (sheetId === undefined || sheetId === null) {
					return []
				}

				const columns = await listColumns.call(this, parseInt(sheetId.toString()))
				if (isError(columns)) {
					return []
				}

				return columns.data.map((column) => {
					return {name: column.title, value: column.id}
				})
			}
		}
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter("resource")
		if (resource === "row") {
			const result = [this.helpers.returnJsonArray(await rowExecutor.call(this))]
			console.log(result)
			return result
		} else if (resource === "sheet") {
			const result = [this.helpers.returnJsonArray(await sheetExecutor.call(this))]
			console.log(result)
			return result
		}
		return []
	}
}
