export interface GenericError {

	refId: string
	errorCode: number
	message: string
}

export function isError(object: any): object is GenericError {
	return 'refId' in object && 'errorCode' in object && 'message' in object
}
