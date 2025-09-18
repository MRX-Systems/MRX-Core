import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import type { CrudOperationUpdate } from '#/modules/elysia/crud/types/crud-operation-update';
import { dbResolver } from '#/modules/elysia/db-resolver/db-resolver';

export const update = <
	const TDatabase extends Omit<MSSQLDatabaseOptions, 'databaseName'> | string,
	const TTableName extends string,
	const THeaderSchema extends TObject,
	const TSourceUpdateSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	database: TDatabase,
	tableName: TTableName,
	{
		hook,
		method = 'PATCH',
		path = '/'
	}: CrudOperationUpdate<THeaderSchema, TSourceUpdateSchema, TSourceResponseSchema>
) => new Elysia({
	name: `update[${tableName}]`
})
	.use(dbResolver('database:'))
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const body = ctx.body as {
				queryOptions: {
					selectedFields: string[] | string;
					filters: Record<string, unknown>;
				};
				data: Record<string, unknown>;
			};

			const data = await db.getRepository(tableName).update(body.data, {
				filters: body.queryOptions.filters,
				selectedFields: body.queryOptions.selectedFields ?? '*',
				throwIfNoResult: true
			});
			return {
				message: data.length === 0
					? `No records updated in ${tableName}`
					: `Updated records in ${tableName}`,
				content: data
			};
		},
		{
			...(
				typeof database === 'string'
					? {
						injectStaticDB: database
					}
					: {
						injectDynamicDB: database
					}
			),
			body: `${tableName}Update`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);