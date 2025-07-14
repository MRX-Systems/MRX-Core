import type { TObject } from '@sinclair/typebox/type';
import type { CrudOperationBaseOptions } from './crudOperationBaseOptions';

export interface CrudOperations<TInferedObject extends TObject> {
	readonly find?: CrudOperationBaseOptions<TInferedObject> | true;
	readonly findOne?: CrudOperationBaseOptions<TInferedObject> | true;
	readonly insert?: CrudOperationBaseOptions<TInferedObject> | true;
	readonly update?: CrudOperationBaseOptions<TInferedObject> | true;
	readonly updateOne?: CrudOperationBaseOptions<TInferedObject> | true;
	readonly delete?: CrudOperationBaseOptions<TInferedObject> | true;
	readonly deleteOne?: CrudOperationBaseOptions<TInferedObject> | true;
	readonly count?: CrudOperationBaseOptions<TInferedObject> | true;
}