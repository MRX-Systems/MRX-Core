import type { TObject } from '@sinclair/typebox/type';
import { Elysia } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import type { CrudOperationCount } from '#/modules/elysia/crud/types/crud-operation-count';


export const count = <
	const THeaderSchema extends TObject,
	const TSourceCountSchema extends TObject
>(
	tableName: string,
	{
		hook,
		method = 'POST',
		path = '/count'
	}: CrudOperationCount<THeaderSchema, TSourceCountSchema>
) => new Elysia({
	name: `count[${tableName}]`
})
	.route(
		method,
		path,
		async (ctx: Record<string, unknown>) => {
			const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
			const body = ctx.body as {
				queryOptions: Record<string, unknown>;
			};
			const data = await db.getRepository(tableName).count({
				...body.queryOptions,
				throwIfNoResult: true
			});
			return {
				message: `Counted records in ${tableName}`,
				content: data
			};
		},
		{
			body: `${tableName}Count`,
			response: `${tableName}CountResponse200`,
			...hook
		} as Record<string, unknown>
	);