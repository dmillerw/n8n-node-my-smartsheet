export interface AddedRow {

	toTop?: boolean
	toBottom?: boolean
	cells: AddedRowCell[]
}

export interface AddedRowCell {

	columnId: number
	value: any
}
