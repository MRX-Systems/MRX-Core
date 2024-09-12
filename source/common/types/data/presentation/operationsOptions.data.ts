import type { BaseOperationOptions } from './baseOperationOptions.data.js';
import type { CountOperationOptions } from './countOperationOptions.data.js';
import type { DeleteOneOperationOptions } from './deleteOneOperationOptions.data.js';
import type { DeleteOperationOptions } from './deleteOperationOptions.data.js';
import type { FindOneOperationOptions } from './findOneOperationOptions.data.js';
import type { FindOperationOptions } from './findOperationOptions.data.js';
import type { InsertOperationOptions } from './insertOperationOptions.data.js';
import type { UpdateOneOperationOptions } from './updateOneOperationOptions.data.js';
import type { UpdateOperationOptions } from './updateOperationOptions.data.js';

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
