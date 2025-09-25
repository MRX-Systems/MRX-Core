import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import { CRUD_SUCCESS_KEYS } from '#/modules/elysia/crud/enums/crud-success-keys';
import type { CrudOperationFindOne } from '#/modules/elysia/crud/types/crud-operation-find-one';
import { dbResolver } from '#/modules/elysia/db-resolver/db-resolver';
import { getDbInjection } from './utils/get-db-injection';

export const findOne = <
	const TDatabase extends Omit<MSSQLDatabaseOptions, 'databaseName'> | string,
	const TTableName extends string,
	const THeaderSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	database: TDatabase,
	tableName: TTableName,
	{
		hook,
		method = 'GET',
		path = '/:id'
	}: CrudOperationFindOne<THeaderSchema, TSourceResponseSchema>
) => new Elysia({
	name: `findOne[${tableName}]`
})
	.use(dbResolver('database:'))
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const { id } = ctx.params as { id: string | number };
			const [primaryKey] = db.getTable(tableName).primaryKey;

			const data = await db.getRepository(tableName).find({
				filters: {
					[primaryKey]: id
				},
				throwIfNoResult: {
					httpStatusCode: 'NOT_FOUND',
					message: `Record with id ${id} not found in ${tableName}`
				}
			});
			return {
				message: CRUD_SUCCESS_KEYS.FIND_ONE_RESPONSE,
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