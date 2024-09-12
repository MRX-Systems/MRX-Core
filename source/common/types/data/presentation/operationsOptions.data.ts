import type { BaseOperationOptions } from './baseOperationOptions.data.ts';
import type { CountOperationOptions } from './countOperationOptions.data.ts';
import type { DeleteOneOperationOptions } from './deleteOneOperationOptions.data.ts';
import type { DeleteOperationOptions } from './deleteOperationOptions.data.ts';
import type { FindOneOperationOptions } from './findOneOperationOptions.data.ts';
import type { FindOperationOptions } from './findOperationOptions.data.ts';
import type { InsertOperationOptions } from './insertOperationOptions.data.ts';
import type { UpdateOneOperationOptions } from './updateOneOperationOptions.data.ts';
import type { UpdateOperationOptions } from './updateOperationOptions.data.ts';

/**
 * Operations configuration.
 */
export interface OperationsOptions<T> {
    insert: Partial<BaseOperationOptions> & Partial<InsertOperationOptions<T>>;
    find: Partial<BaseOperationOptions> & Partial<FindOperationOptions>;
    findOne: Partial<BaseOperationOptions> & Partial<FindOneOperationOptions>;
    update: Partial<BaseOperationOptions> & Partial<UpdateOperationOptions> ;
    updateOne: Partial<BaseOperationOptions> & Partial<UpdateOneOperationOptions>;
    delete: Partial<BaseOperationOptions> & Partial<DeleteOperationOptions>;
    deleteOne: Partial<BaseOperationOptions> & Partial<DeleteOneOperationOptions>;
    count: Partial<BaseOperationOptions> & Partial<CountOperationOptions>;
}
