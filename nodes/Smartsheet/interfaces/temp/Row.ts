import Cell from "./Cell";
import Column from "./Column";

export default interface Row {
	id: number;
	sheetId: number;
	accessLevel: string;
	attachments?: [{
		id: number;
		parentId: number;
		attachmentType: string;
		attachmentSubType: string;
		mimeType: string;
		parentType: string;
		createdAt: string | number;
		createdBy: { email: string; name: string; };
		name: string;
		sizeInKb: number;
		url: string;
		urlExpiresInMillis: number;
	}];
	cells: Cell[];
	columns: Column[];
	conditionalFormat?: string;
	createdAt: string | number;
	createdBy?: { email: string; name: string; };
	discussions?: any;
	proofs?: any;
	expanded?: boolean;
	filteredOut?: boolean;
	format?: string;
	inCriticalPath?: boolean;
	locked?: boolean;
	lockedForUser?: boolean;
	modifiedAt?: string | number;
	modifiedBy?: { email: string; name: string; };
	permaLink?: string;
	rownumber: number;
	version?: number;
}
