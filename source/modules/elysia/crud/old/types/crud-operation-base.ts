export interface CrudOperationBase {
	readonly path?: string;
	readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}
