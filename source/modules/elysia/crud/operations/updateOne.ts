import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { CrudOperationUpdateOne } from '#/modules/elysia/crud/types/crud-operation-update-one';

export const updateOne = <
	const THeaderSchema extends TObject,
	const TSourceUpdateSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	tableName: string,
	{
		hook,
		method = 'PATCH',
		path = '/:id'
	}: CrudOperationUpdateOne<THeaderSchema, TSourceUpdateSchema, TSourceResponseSchema>
) => new Elysia({
	name: `updateOne[${tableName}]`
})
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const { id } = ctx.params as { id: string | number };
			const body = ctx.body as {
				data: Record<string, unknown>;
			};
			const [primaryKey] = db.getTable(tableName).primaryKey;

			const data = await db.getRepository(tableName).update(body.data, {
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
				message: `Updated record with id ${id} in ${tableName}`,
				content: data
			};
		},
		{
			// params: `${tableName}IdParam`,
			body: `${tableName}UpdateOne`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);