export default interface Column {

	id?: number;
	version?: number;
	index?: number;
	title: string;
	type: any;
	options?: string[];
	primary?: boolean;
	validation?: boolean;
	width: string;
	symbol?: string;
}
