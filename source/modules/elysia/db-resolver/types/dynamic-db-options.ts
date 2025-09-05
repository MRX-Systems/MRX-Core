import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';

export interface DynamicDbOptions {
	/**
	 * Options for the database connection
	 */
	readonly config: Omit<MSSQLDatabaseOptions, 'databaseName'>;
}