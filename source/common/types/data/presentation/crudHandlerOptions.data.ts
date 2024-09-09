import type { DynamicDatabaseOptions } from '../database/index.js';

export interface CrudHandlerOptions<T> {
    /**
     * The table name.
     */
    table: string;
    /**
     * The key inclusion is using for clean the request body or request query.
     */
    keyInclusion: readonly (keyof T)[];
    /**
     * The database name.
     */
    databaseName?: string | undefined;
    /**
     * The dynamic database configuration. ({@link DynamicDatabaseOptions})
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
