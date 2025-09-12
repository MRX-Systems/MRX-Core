import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { CrudOperationUpdate } from '#/modules/elysia/crud/types/crud-operation-update';

export const update = <
	const THeaderSchema extends TObject,
	const TSourceUpdateSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	tableName: string,
	{
		hook,
		method = 'PATCH',
		path = '/'
	}: CrudOperationUpdate<THeaderSchema, TSourceUpdateSchema, TSourceResponseSchema>
) => new Elysia({
	name: `update[${tableName}]`
})
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const body = ctx.body as {
				queryOptions: {
					filters: Record<string, unknown>;
					orderBy?: Record<string, unknown>;
					selectedFields: string[] | string;
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
			body: `${tableName}Update`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);