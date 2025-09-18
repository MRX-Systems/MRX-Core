import { Elysia, t } from 'elysia';

import { BaseError } from '#/errors/base-error';
import { MSSQL } from '#/modules/database/mssql';
import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import { SingletonManager } from '#/modules/singleton-manager/singleton-manager';
import { DB_RESOLVER_ERROR_KEYS } from './enums/db-resolver-error-keys';

export const dbResolver = (prefixDatabaseName = '') => new Elysia()
	.model({
		dbResolverHeader: t.Object({
			'database-using': t.String()
		})
	})
	.macro({
		injectDynamicDB(config: Omit<MSSQLDatabaseOptions, 'databaseName'>) {
			return {
				headers: 'dbResolverHeader',
				async resolve({ headers }) {
					const databaseName = headers['database-using'] as string;

					if (!SingletonManager.has(`${prefixDatabaseName}${databaseName}`)) {
						SingletonManager.register(`${prefixDatabaseName}${databaseName}`, new MSSQL({
							...config,
							databaseName
						}));
						await SingletonManager.get<MSSQL>(`${prefixDatabaseName}${databaseName}`).connect();
					}
					return {
						dynamicDB: SingletonManager.get<MSSQL>(`${prefixDatabaseName}${databaseName}`)
					};
				}
			};
		},
		injectStaticDB(databaseName: string) {
			return {
				resolve() {
					if (!SingletonManager.has(`${prefixDatabaseName}${databaseName}`))
						throw new BaseError(DB_RESOLVER_ERROR_KEYS.DB_RESOLVER_STATIC_DB_NOT_FOUND, databaseName);

					return {
						staticDB: SingletonManager.get<MSSQL>(`${prefixDatabaseName}${databaseName}`)
					};
				}
			};
		}
	});