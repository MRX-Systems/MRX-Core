import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { CrudOperationFind } from '#/modules/elysia/crud/types/crud-operation-find';

export const find = <
	const THeaderSchema extends TObject,
	const TSourceFindSchema extends TObject,
	const TSourceResponseSchema extends TObject
>(
	tableName: string,
	{
		hook,
		method = 'POST',
		path = '/find'
	}: CrudOperationFind<THeaderSchema, TSourceFindSchema, TSourceResponseSchema>
) => new Elysia({
	name: `find[${tableName}]`
})
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
			body: `${tableName}Find`,
			response: `${tableName}Response200`,
			...hook
		} as Record<string, unknown>
	);