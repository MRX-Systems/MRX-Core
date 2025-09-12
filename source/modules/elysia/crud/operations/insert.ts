import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { CrudOperationInsert } from '#/modules/elysia/crud/types/crud-operation-insert';

export const insert = <
	const THeaderSchema extends TObject,
	const TSourceInsertSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	tableName: string,
	{
		hook,
		method = 'POST',
		path = '/'
	}: CrudOperationInsert<THeaderSchema, TSourceInsertSchema, TSourceResponseSchema>
) => new Elysia({
	name: `insert[${tableName}]`
})
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const body = ctx.body as {
				queryOptions?: {
					selectedFields: string[] | string;
				};
				data: Record<string, unknown> | Record<string, unknown>[];
			};

			const selectedFields = body.queryOptions?.selectedFields ?? '*';

			const data = await db.getRepository(tableName).insert<Record<string, unknown>>(body.data, {
				selectedFields,
				throwIfNoResult: true
			});
			return {
				message: `Inserted record into ${tableName}`,
				content: data
			};
		},
		{
			body: `${tableName}Insert`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);