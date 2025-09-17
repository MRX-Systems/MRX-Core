import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { CrudOperationDelete } from '#/modules/elysia/crud/types/crud-operation-delete';

// We can't use "delete" as function name instead we use batchDelete
export const batchDelete = <
	const THeaderSchema extends TObject,
	const TSourceDeleteSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	tableName: string,
	{
		hook,
		method = 'DELETE',
		path = '/'
	}: CrudOperationDelete<THeaderSchema, TSourceDeleteSchema, TSourceResponseSchema>
) => new Elysia({
	name: `delete[${tableName}]`
})
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const body = ctx.body as {
				queryOptions: {
					selectedFields?: string[] | string;
					filters: Record<string, unknown>;
				};
			};
			const selectedFields = body.queryOptions?.selectedFields ?? '*';
			const data = await db.getRepository(tableName).delete<Record<string, unknown>>({
				filters: body.queryOptions.filters,
				selectedFields,
				throwIfNoResult: true
			});
			return {
				message: `Deleted records from ${tableName}`,
				content: data
			};
		},
		{
			body: `${tableName}Delete`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);