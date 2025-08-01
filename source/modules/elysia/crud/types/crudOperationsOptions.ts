import type { CrudOperationCountOptions } from './crudOperationCountOptions';
import type { CrudOperationDeleteOneOptions } from './crudOperationDeleteOneOptions';
import type { CrudOperationDeleteOptions } from './crudOperationDeleteOptions';
import type { CrudOperationFindOneOptions } from './crudOperationFindOneOptions';
import type { CrudOperationFindOptions } from './crudOperationFindOptions';
import type { CrudOperationInsertOptions } from './crudOperationInsertOptions';
import type { CrudOperationUpdateOneOptions } from './crudOperationUpdateOneOptions';
import type { CrudOperationUpdateOptions } from './crudOperationUpdateOptions';

export interface CrudOperationsOptions {
	readonly find?: CrudOperationFindOptions | true;
	readonly findOne?: CrudOperationFindOneOptions| true;
	readonly insert?: CrudOperationInsertOptions | true;
	readonly update?: CrudOperationUpdateOptions | true;
	readonly updateOne?: CrudOperationUpdateOneOptions | true;
	readonly delete?: CrudOperationDeleteOptions| true;
	readonly deleteOne?: CrudOperationDeleteOneOptions| true;
	readonly count?: CrudOperationCountOptions| true;
}