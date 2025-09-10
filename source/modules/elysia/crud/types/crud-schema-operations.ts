export interface CrudSchemaOperations {
	count?: boolean;
	find?: boolean;
	findOne?: boolean;
	insert?: boolean;
	update?: boolean;
	updateOne?: boolean;
	delete?: boolean;
	deleteOne?: boolean;
}