import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { CrudOperationDeleteOne } from '#/modules/elysia/crud/types/crud-operation-delete-one';

export const deleteOne = <
	const THeaderSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	tableName: string,
	{
		hook,
		method = 'DELETE',
		path = '/:id'
	}: CrudOperationDeleteOne<THeaderSchema, TSourceResponseSchema>
) => new Elysia({
	name: `deleteOne[${tableName}]`
})
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
			// params: `${tableName}IdParam`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);