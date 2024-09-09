import type { DynamicDatabaseOptions } from '../database/index.js';
import type { OperationOptions } from './operationOptions.data.js';

/**
 * Interface for Abstract CRUD configuration.
 *
 * @typeParam T - The type of the data.
 */
export interface AbstractCrudOptions<T> {
    /**
     * The table name.
     */
    table: string;

    /**
     * The prefix for the CRUD routes.
     */
    prefix: string;

    /**
     * The key inclusion is used to clean the request body or the request query.
     */
    keyInclusion: readonly (keyof T)[];

    /**
     * The operations configuration. ({@link OperationOptions})
     */
    operations: Partial<{
        insert: Partial<OperationOptions>;
        find: Partial<OperationOptions>;
        findOne: Partial<OperationOptions>;
        update: Partial<OperationOptions>;
        updateOne: Partial<OperationOptions>;
        delete: Partial<OperationOptions>;
        deleteOne: Partial<OperationOptions>;
        count: Partial<OperationOptions>;
    }>;

    /**
     * The database name.
     * Set undefined for dynamic database name based on the request header. (database-using)
     */
    databaseName?: string | undefined;

    /**
     * The dynamic database configuration if the database name is undefined.
     * Allow to create a dynamic database based on the request header in the factory database.
     */
    dynamicDatabaseConfig?: DynamicDatabaseOptions | undefined;

    /**
     * The primary key for the table.
     * The first element is the key name and the second element is the key type.
     *
     * Undefined uses the default primary key. (id, NUMBER)
     *
     * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
     *
     * @example
     *
     * primaryKey: ['uuid', 'STRING']
     */
    primaryKey?: [keyof T, 'NUMBER' | 'STRING'] | undefined;
}
