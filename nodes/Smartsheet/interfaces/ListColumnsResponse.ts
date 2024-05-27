import {PagedResponse} from "./PagedResponse";

export interface ListColumnsResponse extends PagedResponse<ListedColumn>{}

export interface ListedColumn {

	id: number
	index: number
	symbol?: string
	title: string
	type: string
	validation: boolean
}
