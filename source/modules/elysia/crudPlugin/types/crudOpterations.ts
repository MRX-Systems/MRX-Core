import type { CrudOperationOptions } from './crudOperationOptions';

export interface CrudOperations {
    readonly find?: CrudOperationOptions;
    readonly findOne?: CrudOperationOptions;
    readonly insert?: CrudOperationOptions;
    readonly update?: CrudOperationOptions;
    readonly updateOne?: CrudOperationOptions;
    readonly delete?: CrudOperationOptions;
    readonly deleteOne?: CrudOperationOptions;
    readonly count?: CrudOperationOptions;
}