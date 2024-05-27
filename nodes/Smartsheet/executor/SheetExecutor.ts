import {IDataObject, IExecuteFunctions} from "n8n-workflow";
import {getSheet} from "../SmartsheetApi";
import {isError} from "../interfaces/GenericError";
import {GenericValue} from "n8n-workflow/dist/Interfaces";

export async function sheetExecutor(this: IExecuteFunctions): Promise<IDataObject | IDataObject[]> {
	const returnData: IDataObject[] = []

	const operation = this.getNodeParameter("operation", 0)

	const items = this.getInputData()
	const length = items.length

	for (let i=0; i<length; i++) {
		if (operation === "get") {
			const result = await execGetSheet.call(this, i)
			if (result !== null) {
				returnData.push(result)
			}
		}
	}

	return returnData
}

async function execGetSheet(this: IExecuteFunctions, index: number): Promise<IDataObject | null> {
	const sheetId = this.getNodeParameter('sheetId', index)
	if (sheetId === undefined || sheetId === null) {
		return null
	}

	const rawResponse = (this.getNodeParameter("rawResponse", index) as boolean)
	const response = await getSheet.call(this, parseInt(sheetId.toString()))
	if (isError(response)) {
		return null
	}

	if (!rawResponse) {
		const rows: IDataObject[] = []

		const columnMap: { [key: number]: string } = {}
		for (const column of response.columns) {
			if (column.id === undefined) {
				continue
			}

			columnMap[column.id] = column.title
		}

		for (const row of response.rows) {
			const rowObj: { [key: string]: GenericValue } = {}
			for (const cell of row.cells) {
				rowObj[columnMap[cell.columnId]] = cell.value
			}

			rows.push(rowObj)
		}

		// return rows.map((row) => {
		// 	return {
		// 		json: row,
		// 		pairedItem: index
		// 	}
		// })
		return {rows: rows}
	}

	// @ts-ignore
	return this.helpers.returnJsonArray(response)
}
