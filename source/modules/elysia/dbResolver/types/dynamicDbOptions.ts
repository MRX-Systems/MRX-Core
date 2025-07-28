import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssqlDatabaseOption';

export interface DynamicDbOptions<
	THeaderKeyName extends string = 'database-using'
> {
	/**
	 * Options for the database connection
	 */
	readonly config: Omit<MSSQLDatabaseOptions, 'databaseName'>;
	/**
	 * The name of the key to be used in the header to select the database
	 * @example 'x-database-name'
	 *
	 * @defaultValue 'database-using'
	 */
	readonly headerKeyName?: THeaderKeyName;
}