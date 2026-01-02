import { Elysia, t } from 'elysia';

import { InternalError } from '#/errors/internal-error';
import { MSSQL } from '#/modules/database/mssql';
import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import { SingletonManager } from '#/modules/singleton-manager/singleton-manager';
import type { TObject, TString } from '@sinclair/typebox';
import { DB_RESOLVER_ERROR_KEYS } from './enums/db-resolver-error-keys';

export const dbResolver = (prefixDatabaseName = '') => new Elysia()
	.model({
		DbResolverHeader: t.Object({
			'database-using': t.String()
		})
	})
	.macro({
		injectDynamicDB(config: Omit<MSSQLDatabaseOptions, 'databaseName'>) {
			return {
				headers: 'DbResolverHeader',
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
						throw new InternalError(DB_RESOLVER_ERROR_KEYS.DB_RESOLVER_STATIC_DB_NOT_FOUND, `${prefixDatabaseName}${databaseName}`);

					return {
						staticDB: SingletonManager.get<MSSQL>(`${prefixDatabaseName}${databaseName}`)
					};
				}
			};
		}
	}) as unknown as Elysia<
	'',
	{
		decorator: {};
		store: {};
		derive: {};
		resolve: {};
	},
	{
		typebox: { DbResolverHeader: TObject<{ 'database-using': TString }> };
		error: {};
	},
	{
		macro: Partial<{
			readonly injectDynamicDB: Omit<MSSQLDatabaseOptions, 'databaseName'>;
			readonly injectStaticDB: string;
		}>;
		macroFn: {
			readonly injectDynamicDB: (config: Omit<MSSQLDatabaseOptions, 'databaseName'>) => {
				readonly resolve: () => Promise<{
					dynamicDB: MSSQL;
				}>;
			};
			readonly injectStaticDB: (databaseName: string) => {
				readonly resolve: () => {
					staticDB: MSSQL;
				};
			};
		};
		parser: {};
		response: {};
		schema: {};
		standaloneSchema: {};
	}>;