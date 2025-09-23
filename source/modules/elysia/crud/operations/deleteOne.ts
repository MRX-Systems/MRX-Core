import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import type { CrudOperationDeleteOne } from '#/modules/elysia/crud/types/crud-operation-delete-one';
import { dbResolver } from '#/modules/elysia/db-resolver/db-resolver';
import { getDbInjection } from './utils/get-db-injection';

export const deleteOne = <
	const TDatabase extends Omit<MSSQLDatabaseOptions, 'databaseName'> | string,
	const TTableName extends string,
	const THeaderSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	database: TDatabase,
	tableName: TTableName,
	{
		hook,
		method = 'DELETE',
		path = '/:id'
	}: CrudOperationDeleteOne<THeaderSchema, TSourceResponseSchema>
) => new Elysia({
	name: `deleteOne[${tableName}]`
})
	.use(dbResolver('database:'))
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const { id } = ctx.params as { id: string | number };

			const [primaryKey] = db.getTable(tableName).primaryKey;

			const data = await db.getRepository(tableName).delete<Record<string, unknown>>({
				selectedFields: '*',
				filters: {
					[primaryKey]: id
				},
				throwIfNoResult: {
					httpStatusCode: 'NOT_FOUND',
					message: `Record with id ${id} not found in ${tableName}`
				}
			});
			return {
				message: `Deleted record with id ${id} from ${tableName}`,
				content: data
			};
		},
		{
			...getDbInjection(database),
			params: `${tableName}IdParam`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);