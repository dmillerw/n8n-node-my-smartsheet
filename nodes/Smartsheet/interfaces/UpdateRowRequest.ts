export interface UpdatedRow {

	id: number
	cells: UpdatedRowCell[]
}

export interface UpdatedRowCell {

	columnId: number
	value: any
}
