import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';

export const getDbInjection = (database: Omit<MSSQLDatabaseOptions, 'databaseName'> | string) => (
	typeof database === 'string'
		? {
			injectStaticDB: database
		}
		: {
			injectDynamicDB: database
		}
);