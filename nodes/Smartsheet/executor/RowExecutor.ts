import {IDataObject, IExecuteFunctions} from "n8n-workflow";
import {AddedRow, AddedRowCell} from "../interfaces/AddRowRequest";
import {addRow, getSheet, updateRow} from "../SmartsheetApi";
import {isError} from "../interfaces/GenericError";
import {GenericValue} from "n8n-workflow/dist/Interfaces";
import Sheet from "../interfaces/temp/Sheet";
import {UpdatedRow, UpdatedRowCell} from "../interfaces/UpdateRowRequest";

type GetSheet = (sheetId: number) => Promise<Sheet | null>

export async function rowExecutor(this: IExecuteFunctions): Promise<IDataObject | IDataObject[]> {
	const sheetCache: { [key: number]: Sheet } = {}
	const _getSheet: GetSheet = async (sheetId: number) => {
		if (sheetId in sheetCache) {
			return sheetCache[sheetId]
		} else {
			const sheet = await getSheet.call(this, sheetId)
			if (isError(sheet)) {
				return null
			}

			sheetCache[sheetId] = sheet

			return sheet
		}
	}

	const returnData: IDataObject[] = []

	const operation = this.getNodeParameter("operation", 0)

	const items = this.getInputData()
	const length = items.length

	for (let i = 0; i < length; i++) {
		if (operation === "create") {
			const result = await createRow.call(this, i)
			if (result !== null) {
				returnData.push(result)
			}
		} else if (operation === "get") {
			const result = await getRow.call(this, _getSheet, i)
			if (result !== null) {
				returnData.push(result)
			}
		} else if (operation === "update") {
			const result = await execUpdateRow.call(this, i)
			if (result !== null) {
				returnData.push(result)
			}
		} else if (operation === "find") {
			const result = await execFindRow.call(this, i)
			if (result !== null) {
				returnData.push(result)
			}
		}
	}

	return returnData
}

async function createRow(this: IExecuteFunctions, index: number): Promise<IDataObject | null> {
	const sheetId = this.getNodeParameter('sheetId', index)
	if (sheetId === undefined || sheetId === null) {
		return null
	}

	// @ts-ignore
	const cells: { cellValues: AddedRowCell[] } = this.getNodeParameter("cells", index)
	if (cells === undefined || cells === null) {
		return null
	}
	const location = this.getNodeParameter("location", index)

	let payload: AddedRow = {cells: cells.cellValues as AddedRowCell[]}
	if (location === "top") {
		payload.toTop = true
	} else if (location === "bottom") {
		payload.toBottom = true
	}

	const response = await addRow.call(this, sheetId as number, payload)
	if (isError(response)) {
		return null
	}

	return response
}

async function execUpdateRow(this: IExecuteFunctions, index: number): Promise<IDataObject | null> {
	const sheetId = this.getNodeParameter('sheetId', index)
	if (sheetId === undefined || sheetId === null) {
		return null
	}

	const rowId = this.getNodeParameter("rowId", index)
	if (rowId === undefined || rowId === null) {
		return null
	}

	const valueType = this.getNodeParameter("valueType", index)
	if (valueType === undefined || valueType === null) {
		return null
	}

	if (valueType === "cells") {
		// @ts-ignore
		const cells: { cellValues: AddedRowCell[] } = this.getNodeParameter("cells", index)
		if (cells === undefined || cells === null) {
			return null
		}

		let payload: UpdatedRow = {id: rowId as number, cells: cells.cellValues as UpdatedRowCell[]}

		const response = await updateRow.call(this, sheetId as number, payload)
		if (isError(response)) {
			return null
		}

		return response
	} else if (valueType === "json") {
		const json = this.getNodeParameter("json", index)
		if (json === undefined || json === null) {
			return null
		}

		const sheet = await getSheet.call(this, sheetId as number)
		if (isError(sheet)) {
			return null
		}

		const columnMap: { [key: string]: number } = {}
		for (const column of sheet.columns) {
			if (column.id === undefined) {
				continue
			}

			columnMap[column.title] = column.id
		}

		const cells: UpdatedRowCell[] = []
		for (const key of Object.keys(json)) {
			cells.push({columnId: columnMap[key], value: (json as IDataObject)[key]})
		}

		let payload: UpdatedRow = {id: rowId as number, cells: cells as UpdatedRowCell[]}

		const response = await updateRow.call(this, sheetId as number, payload)
		if (isError(response)) {
			return null
		}

		return response
	}

	return null
}

async function execFindRow(this: IExecuteFunctions, index: number): Promise<IDataObject | null> {
	const sheetId = this.getNodeParameter('sheetId', index)
	if (sheetId === undefined || sheetId === null) {
		return null
	}

	const columnId = this.getNodeParameter('columnId', index)
	if (columnId === undefined || columnId === null) {
		return null
	}

	const value = this.getNodeParameter('value', index)
	if (value === undefined || value === null || value === "") {
		return null
	}

	const rawResponse = (this.getNodeParameter("rawResponse", index) as boolean)

	const sheet = await getSheet.call(this, sheetId as number)
	if (isError(sheet)) {
		return null
	}

	// Build a column map (may or may not use)
	const columnMap: { [key: number]: string } = {}
	for (const column of sheet.columns) {
		if (column.id === undefined) {
			continue
		}

		columnMap[column.id] = column.title
	}

	const filteredRows = sheet.rows.filter((row) => {
		for (const cell of row.cells) {
			if (cell.columnId === columnId as number) {
				if (cell.displayValue === (value.toString())) {
					return true
				}
			}
		}
		return false
	})

	if (filteredRows.length === 0) {
		return null
	}

	if (!rawResponse) {
		const row = filteredRows[0]
		const rowObj: { [key: string]: GenericValue } = {
			"_rowId": row.id
		}

		for (const cell of row.cells) {
			rowObj[columnMap[cell.columnId]] = cell.value === undefined ? null : cell.value
		}

		return rowObj
	} else {
		return filteredRows[0] as unknown as IDataObject
	}
}

async function getRow(this: IExecuteFunctions, get: GetSheet, index: number): Promise<IDataObject | null> {
	const sheetId = this.getNodeParameter('sheetId', index)
	if (sheetId === undefined || sheetId === null) {
		return null
	}

	const rowId = this.getNodeParameter("rowId", index)
	if (rowId === undefined || rowId === null) {
		return null
	}

	const rawResponse = (this.getNodeParameter("rawResponse", index) as boolean)
	const response = await get(sheetId as number)
	if (response === null || isError(response)) {
		return null
	}

	// Build a column map (may or may not use)
	const columnMap: { [key: number]: string } = {}
	for (const column of response.columns) {
		if (column.id === undefined) {
			continue
		}

		columnMap[column.id] = column.title
	}

	const filteredRows = response.rows.filter((row) => row.id === (rowId as number))
	if (filteredRows.length === 0) {
		return null
	}

	const row = filteredRows[0]

	if (!rawResponse) {
		const rowObj: { [key: string]: GenericValue } = {
			"_rowId": row.id
		}

		for (const cell of row.cells) {
			rowObj[columnMap[cell.columnId]] = cell.value === undefined ? null : cell.value
		}

		return rowObj
	} else {
		return filteredRows[0] as unknown as IDataObject
	}
}
