import type { CrudOperationCountOptions } from './crud-operation-count-options';
import type { CrudOperationDeleteOneOptions } from './crud-operation-delete-one-options';
import type { CrudOperationDeleteOptions } from './crud-operation-delete-options';
import type { CrudOperationFindOneOptions } from './crud-operation-find-one-options';
import type { CrudOperationFindOptions } from './crud-operation-find-options';
import type { CrudOperationInsertOptions } from './crud-operation-insert-options';
import type { CrudOperationUpdateOptions } from './crud-operation-update-options';
import type { CrudOperationUpdateOneOptions } from './crud-operation-updateOneOptions';

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