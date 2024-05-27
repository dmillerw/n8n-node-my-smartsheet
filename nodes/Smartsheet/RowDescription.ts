import {INodeProperties} from "n8n-workflow";

export const rowOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['row']
			}
		},
		options: [
			{
				name: "Create Row",
				value: "create",
				description: "Create a new row",
				action: "Create a row"
			},
			{
				name: "Update Row",
				value: "update",
				description: "Update a row",
				action: "Update a row"
			},
			{
				name: "Get Row",
				value: "get",
				description: "Get a row",
				action: "Get a row"
			},
			{
				name: "Find Row",
				value: "find",
				description: "Find a row",
				action: "Find a row"
			}
		],
		default: 'create'
	}
]

export const rowFields: INodeProperties[] = [
	// ROW ID
	{
		displayName: "Row",
		name: "rowId",
		type: "string",
		default: "",
		description: "The ID of the target Row",
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['get', 'update']
			}
		}
	},

	// RAW VALUES
	{
		displayName: 'Raw Response',
		name: 'rawResponse',
		type: 'boolean',
		default: true, // Initial state of the toggle
		description: 'Whether to return the raw Smartsheet response or not',
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['get', 'find']
			}
		},
	},

	// ROW LOCATION
	{
		displayName: "Location",
		name: "location",
		type: "options",
		options: [
			{
				name: "Top",
				value: "top",
			},
			{
				name: "Bottom",
				value: "bottom"
			}
		],
		default: "bottom",
		description: "Location to place the new row",
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['create']
			}
		}
	},

	// UPDATE ROW - VALUE TYPE
	{
		displayName: "Value Type",
		name: "valueType",
		type: "options",
		options: [
			{
				name: "Cells",
				value: "cells",
			},
			{
				name: "JSON",
				value: "json"
			}
		],
		default: "cells",
		description: "Method of supplying updated fields",
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['create', 'update']
			}
		}
	},

	// UPDATE ROW - VALUES (CELLS)
	{
		displayName: "Cells",
		name: "cells",
		type: "fixedCollection",
		placeholder: "Add Cell",
		default: {},
		typeOptions: {
			multipleValues: true
		},
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['create', 'update']
			}
		},
		options: [
			{
				name: "cellValues",
				displayName: "Cell",
				values: [
					{
						displayName: "Column",
						name: "columnId",
						type: "options",
						required: true,
						default: "",
						typeOptions: {
							loadOptionsMethod: 'getColumns',
						}
					},
					{
						displayName: "Value",
						name: "value",
						type: "string",
						default: "",
						required: true
					}
				]
			}
		]
	},

	// UPDATE ROW - VALUES (JSON)
	{
		displayName: "JSON",
		name: "json",
		type: "json",
		default: '',
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['create', 'update']
			}
		},
	},

	// FIND ROW - COLUMN
	{
		displayName: "Column",
		name: "columnId",
		type: "options",
		required: true,
		default: "",
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['find']
			}
		},
		typeOptions: {
			loadOptionsMethod: 'getColumns',
		}
	},

	// FIND ROW - VALUE
	{
		displayName: "Value",
		name: "value",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['find']
			}
		},
		required: true
	}
]
