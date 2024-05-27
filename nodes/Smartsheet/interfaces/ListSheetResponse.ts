import {PagedResponse} from "./PagedResponse";

export interface ListSheetResponse extends PagedResponse<ListedSheet>{}

export interface ListedSheet {

	id: number
	accessLevel: string
	createdAt: Date
	modifiedAt: Date
	name: string
	permalink: string
	version: number
	source: {id: number, type: string}
}
