import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import type { CrudOperationFind } from '#/modules/elysia/crud/types/crud-operation-find';
import { dbResolver } from '#/modules/elysia/db-resolver/db-resolver';
import { getDbInjection } from './utils/get-db-injection';

export const find = <
	const TDatabase extends Omit<MSSQLDatabaseOptions, 'databaseName'> | string,
	const TTableName extends string,
	const THeaderSchema extends TObject,
	const TSourceFindSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	database: TDatabase,
	tableName: TTableName,
	{
		hook,
		method = 'POST',
		path = '/find'
	}: CrudOperationFind<THeaderSchema, TSourceFindSchema, TSourceResponseSchema>
) => new Elysia({
	name: `find[${tableName}]`
})
	.use(dbResolver('database:'))
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = (ctx.dynamicDB as MSSQL) || (ctx.staticDB as MSSQL);
			const body = ctx.body as {
				queryOptions: Record<string, unknown>;
			};
			const data = await db.getRepository(tableName).find({
				...(body?.queryOptions || {}),
				throwIfNoResult: false
			});
			return {
				message: `Found ${data.length} records for ${tableName}`,
				content: data
			};
		},
		{
			...getDbInjection(database),
			body: `${tableName}Find`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);