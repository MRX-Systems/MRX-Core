import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { CrudOperationFindOne } from '#/modules/elysia/crud/types/crud-operation-find-one';

export const findOne = <
	const THeaderSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	tableName: string,
	{
		hook,
		method = 'GET',
		path = '/:id'
	}: CrudOperationFindOne<THeaderSchema, TSourceResponseSchema>
) => new Elysia({
	name: `findOne[${tableName}]`
})
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
				message: `Found record with id ${id} in ${tableName}`,
				content: data
			};
		},
		{
			// params: `${tableName}IdParam`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);