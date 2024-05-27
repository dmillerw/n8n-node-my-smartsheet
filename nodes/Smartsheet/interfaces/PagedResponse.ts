export interface PagedResponse<T> {

	pageNumber: number
	pageSize: number
	totalPages: number
	totalCount: number
	data: T[]
}
