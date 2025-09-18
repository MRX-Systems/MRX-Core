import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import type { CrudOperationCount } from '#/modules/elysia/crud/types/crud-operation-count';
import { dbResolver } from '#/modules/elysia/db-resolver/db-resolver';
import { getDbInjection } from './utils/get-db-injection';

export const count = <
	const TDatabase extends Omit<MSSQLDatabaseOptions, 'databaseName'> | string,
	const TTableName extends string,
	const THeaderSchema extends TObject,
	const TSourceCountSchema extends TObject
>(
	database: TDatabase,
	tableName: TTableName,
	{
		hook,
		method = 'POST',
		path = '/count'
	}: CrudOperationCount<THeaderSchema, TSourceCountSchema>
) => new Elysia({
	name: `count[${tableName}]`
})
	.use(dbResolver('database:'))
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const body = ctx.body as {
				queryOptions: Record<string, unknown>;
			};
			const data = await db.getRepository(tableName).count({
				...body.queryOptions,
				throwIfNoResult: true
			});
			return {
				message: `Counted records in ${tableName}`,
				content: data
			};
		},
		{
			...getDbInjection(database),
			body: `${tableName}Count`,
			response: `${tableName}CountResponse200`,
			...hook
		} as Record<string, unknown>
	);