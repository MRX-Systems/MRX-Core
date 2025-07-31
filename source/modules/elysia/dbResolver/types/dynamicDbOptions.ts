import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssqlDatabaseOption';

export interface DynamicDbOptions {
	/**
	 * Options for the database connection
	 */
	readonly config: Omit<MSSQLDatabaseOptions, 'databaseName'>;
}