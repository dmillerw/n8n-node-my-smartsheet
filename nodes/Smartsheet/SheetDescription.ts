import {INodeProperties} from "n8n-workflow";

export const sheetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sheet']
			}
		},
		options: [
			{
				name: "Get Sheet",
				value: "get",
				description: "Get a sheet",
				action: "Get a sheet"
			}
		],
		default: 'get'
	}
]

export const sheetFields: INodeProperties[] = [
	{
		displayName: 'Raw Response',
		name: 'rawResponse',
		type: 'boolean',
		default: true, // Initial state of the toggle
		description: 'Whether to return the raw Smartsheet response or not',
		displayOptions: {
			show: {
				resource: ['sheet'],
				operation: ['get']
			}
		},
	}
]
