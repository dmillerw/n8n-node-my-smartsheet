import Row from "./Row";
import Column from "./Column";

export default interface Sheet {

	id: number;
	rows: Row[];
	columns: Column[];
}
