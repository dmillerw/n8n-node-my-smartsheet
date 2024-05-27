export default interface Cell {
	columnId: number;
	columnType: string;
	conditionalFormat?: string;
	displayValue?: string;
	format?: string;
	formula?: string;
	overrideValidation?: boolean;
	strict?: boolean;
	value: string | number | boolean;
	hyperlink: {
		reportId: number;
		sheetId: number;
		sightId: number;
		url: string;
	};
	image?: {
		altText: string;
		height: number;
		id: string;
		width: number;
	};
	linkInFromCell?: {
		columnId: number;
		rowId: number;
		sheetId: number;
		sheetName: string;
		status: string;
	};
	linksOutToCells?: [
		{
			columnId: number;
			rowId: number;
			sheetId: number;
			sheetName: string;
			status: string;
		}
	];
}
