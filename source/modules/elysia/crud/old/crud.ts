import type {
	TObject,
	TString
} from '@sinclair/typebox';
import { Elysia, type SingletonBase, t } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import { crudSchema } from '#/modules/elysia/crud/crud-schema';
import type { CrudSchemaModelsType } from '#/modules/elysia/crud/types/crud-schema-models-type';
import { dbResolver } from '#/modules/elysia/db-resolver/db-resolver';
import type { DynamicDbOptions } from '#/modules/elysia/db-resolver/types/dynamic-db-options';
import type { CrudOperationCount } from './types/crud-operation-count';
import type { CrudOperationDelete } from './types/crud-operation-delete';
import type { CrudOperationDeleteOne } from './types/crud-operation-delete-one';
import type { CrudOperationFind } from './types/crud-operation-find';
import type { CrudOperationFindOne } from './types/crud-operation-find-one';
import type { CrudOperationInsert } from './types/crud-operation-insert';
import type { CrudOperationUpdate } from './types/crud-operation-update';
import type { CrudOperationUpdateOne } from './types/crud-operation-update-one';
import type { CrudOperations } from './types/crud-operations';
import type { CrudOptions } from './types/crud-options';

const _createDefaultOperationsWithHandlers = <
	const TDatabase extends DynamicDbOptions | string,
	const TTableName extends string
>(
	tableName: TTableName,
	database: TDatabase
) => {
	const _requiredHeaderDatabase = typeof database === 'object'
		? { headers: 'dbResolverHeader' } as const // Header required for dynamic database selection
		: {} as const; // No header needed for static database

	return {
		insert: {
			method: 'POST',
			path: '/',
			hook: {
				..._requiredHeaderDatabase,
				body: `${tableName}Insert`,
				response: `${tableName}Response200`
			},
			handler: async (ctx: Record<string, unknown>) => {
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
			}
		},
		find: {
			method: 'POST' as const,
			path: '/search',
			hook: {
				..._requiredHeaderDatabase,
				body: `${tableName}Find`,
				response: `${tableName}Response200`
			},
			handler: async (ctx: Record<string, unknown>): Promise<{
				message: string;
				content: unknown[];
			}> => {
				const db = (ctx.dynamicDB as MSSQL) || (ctx.staticDB as MSSQL);
				const body = ctx.body as {
					queryOptions: Record<string, unknown>;
				};

				const data = await db.getRepository(tableName).find({
					...body.queryOptions,
					throwIfNoResult: true
				});

				return {
					message: `Found ${data.length} records for ${tableName}`,
					content: data
				};
			}
		},
		findOne: {
			method: 'GET',
			path: '/:id',
			hook: {
				..._requiredHeaderDatabase,
				// params: `${tableName}IdParam`,
				params: t.Object({
					id: t.Union([
						t.String({
							format: 'uuid'
						}),
						t.Number({
							minimum: 1,
							maximum: Number.MAX_SAFE_INTEGER
						})
					])
				}),
				response: `${tableName}Response200`
			},
			handler: async (ctx: Record<string, unknown>) => {
				const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
				const { id } = ctx.params as { id: string | number };
				const [primaryKey] = db.getTable(tableName).primaryKey;

				const data = await db.getRepository(tableName).find({
					filters: {
						[primaryKey]: id
					},
					throwIfNoResult: true
				});
				return {
					message: `Found record with id ${id} in ${tableName}`,
					content: data
				};
			}
		},
		count: {
			method: 'POST' as const,
			path: '/count',
			hook: {
				..._requiredHeaderDatabase,
				body: `${tableName}Count`,
				response: `${tableName}CountResponse200`
			},
			handler: async (ctx: Record<string, unknown>) => {
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
			}
		},
		update: {
			method: 'PATCH',
			path: '/',
			hook: {
				..._requiredHeaderDatabase,
				body: `${tableName}Update`,
				response: `${tableName}Response200`
			},
			handler: async (ctx: Record<string, unknown>) => {
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
			}
		},
		updateOne: {
			method: 'PATCH',
			path: '/:id',
			hook: {
				..._requiredHeaderDatabase,
				// params: `${tableName}IdParam`,
				params: t.Object({
					id: t.Union([
						t.String({
							format: 'uuid'
						}),
						t.Number({
							minimum: 1,
							maximum: Number.MAX_SAFE_INTEGER
						})
					])
				}),
				body: `${tableName}UpdateOne`,
				response: `${tableName}Response200`
			},
			handler: async (ctx: Record<string, unknown>) => {
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
					throwIfNoResult: true
				});
				return {
					message: `Updated record with id ${id} in ${tableName}`,
					content: data
				};
			}
		},
		delete: {
			method: 'DELETE',
			path: '/',
			hook: {
				..._requiredHeaderDatabase,
				body: `${tableName}Delete`,
				response: `${tableName}Response200`
			},
			handler: async (ctx: Record<string, unknown>) => {
				const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
				const body = ctx.body as {
					queryOptions: {
						filters: Record<string, unknown>;
						selectedFields?: string[] | string;
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
			}
		},
		deleteOne: {
			method: 'DELETE',
			path: '/:id',
			hook: {
				..._requiredHeaderDatabase,
				// params: `${tableName}IdParam`,
				params: t.Object({
					id: t.Union([
						t.String({
							format: 'uuid'
						}),
						t.Number({
							minimum: 1,
							maximum: Number.MAX_SAFE_INTEGER
						})
					])
				}),
				body: `${tableName}DeleteOne`,
				response: `${tableName}Response200`
			},
			handler: async (ctx: Record<string, unknown>) => {
				const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
				const { id } = ctx.params as { id: string | number };
				const body = ctx.body as {
					queryOptions: {
						filters: Record<string, unknown>;
						selectedFields?: string[] | string;
					};
				};
				const selectedFields = body.queryOptions?.selectedFields ?? '*';
				const data = await db.getRepository(tableName).delete<Record<string, unknown>>({
					filters: body.queryOptions.filters,
					selectedFields,
					throwIfNoResult: true
				});
				return {
					message: `Deleted record with id ${id} from ${tableName}`,
					content: data
				};
			}
		}
	};
};

/**
 * Adds routes to the Elysia app based on the enabled operations.
 *
 * @template TDatabase - The database configuration type
 * @template TTableName - The table name type
 * @template TOperations - The operations configuration type
 *
 * @param tableName - The name of the table
 * @param database - The database configuration
 * @param operations - The operations configuration
 *
 * @returns An Elysia app with the configured routes
 */
const _addRoutesByOperations = <
	const TDatabase extends DynamicDbOptions | string,
	const TTableName extends string,
	const TSourceSchema extends TObject,
	const TSourceFindSchema extends TObject = TSourceSchema,
	const TSourceCountSchema extends TObject = TSourceSchema,
	const TSourceInsertSchema extends TObject = TSourceSchema,
	const TSourceUpdateSchema extends TObject = TSourceSchema,
	const TSourceDeleteSchema extends TObject = TSourceSchema,
	const TSourceResponseSchema extends TObject = TSourceSchema,
	const THeaderSchema extends TObject = (
		TDatabase extends string
			? TObject<{}>
			: TObject<{
				'database-using': TString;
			}>
	),
	const TOperations extends CrudOperations<
		THeaderSchema,
		TSourceSchema,
		TSourceFindSchema,
		TSourceCountSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceDeleteSchema,
		TSourceResponseSchema
	> = {
		find: CrudOperationFind<
			THeaderSchema,
			TSourceFindSchema,
			TSourceResponseSchema
		> | true,
		findOne: CrudOperationFindOne<
			THeaderSchema,
			TSourceFindSchema,
			TSourceResponseSchema
		> | true,
		insert: CrudOperationInsert<
			THeaderSchema,
			TSourceInsertSchema,
			TSourceResponseSchema
		> | true,
		update: CrudOperationUpdate<
			THeaderSchema,
			TSourceUpdateSchema,
			TSourceResponseSchema
		> | true,
		updateOne: CrudOperationUpdateOne<
			THeaderSchema,
			TSourceUpdateSchema,
			TSourceResponseSchema
		> | true,
		delete: CrudOperationDelete<
			THeaderSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> | true,
		deleteOne: CrudOperationDeleteOne<
			THeaderSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> | true,
		count: CrudOperationCount<
			THeaderSchema,
			TSourceCountSchema,
			TSourceResponseSchema
		> | true
	}
>(
	tableName: TTableName,
	database: TDatabase,
	operations: TOperations
) => {
	const app = new Elysia();
	const _defaultOperations = _createDefaultOperationsWithHandlers<TDatabase, TTableName>(tableName, database);

	for (const operationKey in operations) {
		const operation = operations[operationKey as keyof TOperations];
		const defaultOperation = _defaultOperations[operationKey as keyof typeof _defaultOperations];

		if (!operation || !defaultOperation)
			continue;

		if (typeof operation === 'boolean') {
			app.route(
				defaultOperation.method,
				defaultOperation.path,
				(ctx: Record<string, unknown>) => defaultOperation.handler(ctx),
				defaultOperation.hook as Record<string, unknown>
			);
		} else if (typeof operation === 'object') {
			const mergedOperation = {
				...defaultOperation,
				...operation
			};

			app.route(
				mergedOperation.method,
				mergedOperation.path,
				(ctx: Record<string, unknown>) => defaultOperation.handler(ctx),
				mergedOperation.hook as Record<string, unknown>
			);
		}
	}

	return app;
};

export const crud = <
	const TDatabase extends DynamicDbOptions | string,
	const TTableName extends string,
	const TSourceSchema extends TObject,
	const TSourceFindSchema extends TObject = TSourceSchema,
	const TSourceCountSchema extends TObject = TSourceSchema,
	const TSourceInsertSchema extends TObject = TSourceSchema,
	const TSourceUpdateSchema extends TObject = TSourceSchema,
	const TSourceDeleteSchema extends TObject = TSourceSchema,
	const TSourceResponseSchema extends TObject = TSourceSchema,
	const THeaderSchema extends TObject = (
		TDatabase extends string
			? TObject<{}>
			: TObject<{
				'database-using': TString;
			}>
	),
	const TOperations extends CrudOperations<
		THeaderSchema,
		TSourceSchema,
		TSourceFindSchema,
		TSourceCountSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceDeleteSchema,
		TSourceResponseSchema
	> = {
		find: CrudOperationFind<
			THeaderSchema,
			TSourceFindSchema,
			TSourceResponseSchema
		> | true,
		findOne: CrudOperationFindOne<
			THeaderSchema,
			TSourceFindSchema,
			TSourceResponseSchema
		> | true,
		insert: CrudOperationInsert<
			THeaderSchema,
			TSourceInsertSchema,
			TSourceResponseSchema
		> | true,
		update: CrudOperationUpdate<
			THeaderSchema,
			TSourceUpdateSchema,
			TSourceResponseSchema
		> | true,
		updateOne: CrudOperationUpdateOne<
			THeaderSchema,
			TSourceUpdateSchema,
			TSourceResponseSchema
		> | true,
		delete: CrudOperationDelete<
			THeaderSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> | true,
		deleteOne: CrudOperationDeleteOne<
			THeaderSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> | true,
		count: CrudOperationCount<
			THeaderSchema,
			TSourceCountSchema,
			TSourceResponseSchema
		> | true
	}
> (
	{
		database,
		tableName,
		schema,
		operations = {
			find: true,
			findOne: true,
			insert: true,
			update: true,
			updateOne: true,
			delete: true,
			deleteOne: true,
			count: true
		} as TOperations,
		tags = [tableName],
		prefix = ''
	}: CrudOptions<
		TDatabase,
		TTableName,
		TSourceSchema,
		TSourceFindSchema,
		TSourceCountSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceDeleteSchema,
		TSourceResponseSchema,
		THeaderSchema,
		TOperations
	>
): Elysia<
	TTableName,
	{
		decorator: SingletonBase['decorator'];
		store: SingletonBase['store'];
		derive: SingletonBase['derive'];
		resolve: Record<
			TDatabase extends string ? 'staticDB' : 'dynamicDB',
			MSSQL
		>
	},
	{
		typebox: CrudSchemaModelsType<
			TTableName,
			{
				find: TOperations['find'] extends true | CrudOperationFind<
					THeaderSchema,
					TSourceFindSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				findOne: TOperations['findOne'] extends true | CrudOperationFindOne<
					THeaderSchema,
					TSourceFindSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				insert: TOperations['insert'] extends true | CrudOperationInsert<
					THeaderSchema,
					TSourceInsertSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				update: TOperations['update'] extends true | CrudOperationUpdate<
					THeaderSchema,
					TSourceUpdateSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				updateOne: TOperations['updateOne'] extends true | CrudOperationUpdateOne<
					THeaderSchema,
					TSourceUpdateSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				delete: TOperations['delete'] extends true | CrudOperationDelete<
					THeaderSchema,
					TSourceDeleteSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				deleteOne: TOperations['deleteOne'] extends true | CrudOperationDeleteOne<
					THeaderSchema,
					TSourceDeleteSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				count: TOperations['count'] extends true | CrudOperationCount<
					THeaderSchema,
					TSourceCountSchema,
					TSourceResponseSchema
				>
					? true
					: false
			},
			TSourceInsertSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> & (
			TDatabase extends string
				? {}
				: {
					ResolveDbHeader: TObject<{
						'database-using': TString;
					}>
				}
		);
		error: {};
	}
> => new Elysia({
	name: `crudPlugin[${tableName}]`,
	tags,
	prefix
})
	.use(dbResolver<TDatabase>(database))
	.use(
		crudSchema<
			TTableName,
			TSourceSchema,
			TSourceInsertSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema,
			{
				find: TOperations['find'] extends true | CrudOperationFind<
					THeaderSchema,
					TSourceFindSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				findOne: TOperations['findOne'] extends true | CrudOperationFindOne<
					THeaderSchema,
					TSourceFindSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				insert: TOperations['insert'] extends true | CrudOperationInsert<
					THeaderSchema,
					TSourceInsertSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				update: TOperations['update'] extends true | CrudOperationUpdate<
					THeaderSchema,
					TSourceUpdateSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				updateOne: TOperations['updateOne'] extends true | CrudOperationUpdateOne<
					THeaderSchema,
					TSourceUpdateSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				delete: TOperations['delete'] extends true | CrudOperationDelete<
					THeaderSchema,
					TSourceDeleteSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				deleteOne: TOperations['deleteOne'] extends true | CrudOperationDeleteOne<
					THeaderSchema,
					TSourceDeleteSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				count: TOperations['count'] extends true | CrudOperationCount<
					THeaderSchema,
					TSourceCountSchema,
					TSourceResponseSchema
				>
					? true
					: false
			}
		>({
			sourceSchemaName: tableName,
			sourceSchema: schema.sourceSchema,
			sourceInsertSchema: schema.sourceInsertSchema as TSourceInsertSchema || schema.sourceSchema as unknown as TSourceInsertSchema,
			sourceFindSchema: schema.sourceFindSchema as TSourceFindSchema || schema.sourceSchema as unknown as TSourceFindSchema,
			sourceCountSchema: schema.sourceCountSchema as TSourceCountSchema || schema.sourceSchema as unknown as TSourceCountSchema,
			sourceUpdateSchema: schema.sourceUpdateSchema as TSourceUpdateSchema || schema.sourceSchema as unknown as TSourceUpdateSchema,
			sourceDeleteSchema: schema.sourceDeleteSchema as TSourceDeleteSchema || schema.sourceSchema as unknown as TSourceDeleteSchema,
			sourceResponseSchema: schema.sourceResponseSchema as TSourceResponseSchema || schema.sourceSchema as unknown as TSourceResponseSchema,
			operations: {
				find: (operations.find ? true : false) as TOperations['find'] extends true | CrudOperationFind<
					THeaderSchema,
					TSourceFindSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				findOne: (operations.findOne ? true : false) as TOperations['findOne'] extends true | CrudOperationFindOne<
					THeaderSchema,
					TSourceFindSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				insert: (operations.insert ? true : false) as TOperations['insert'] extends true | CrudOperationInsert<
					THeaderSchema,
					TSourceInsertSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				update: (operations.update ? true : false) as TOperations['update'] extends true | CrudOperationUpdate<
					THeaderSchema,
					TSourceUpdateSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				updateOne: (operations.updateOne ? true : false) as TOperations['updateOne'] extends true | CrudOperationUpdateOne<
					THeaderSchema,
					TSourceUpdateSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				delete: (operations.delete ? true : false) as TOperations['delete'] extends true | CrudOperationDelete<
					THeaderSchema,
					TSourceDeleteSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				deleteOne: (operations.deleteOne ? true : false) as TOperations['deleteOne'] extends true | CrudOperationDeleteOne<
					THeaderSchema,
					TSourceDeleteSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				count: (operations.count ? true : false) as TOperations['count'] extends true | CrudOperationCount<
					THeaderSchema,
					TSourceCountSchema,
					TSourceResponseSchema
				>
					? true
					: false
			}
		})
	)
	.use(
		_addRoutesByOperations<
			TDatabase,
			TTableName,
			TSourceSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceInsertSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema,
			THeaderSchema,
			TOperations
		>(
			tableName,
			database,
			operations
		)
	) as unknown as Elysia<
	TTableName,
	{
		decorator: SingletonBase['decorator'];
		store: SingletonBase['store'];
		derive: SingletonBase['derive'];
		resolve: Record<
			TDatabase extends string ? 'staticDB' : 'dynamicDB',
			MSSQL
		>
	},
	{
		typebox: CrudSchemaModelsType<
			TTableName,
			{
				find: TOperations['find'] extends true | CrudOperationFind<
					THeaderSchema,
					TSourceFindSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				findOne: TOperations['findOne'] extends true | CrudOperationFindOne<
					THeaderSchema,
					TSourceFindSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				insert: TOperations['insert'] extends true | CrudOperationInsert<
					THeaderSchema,
					TSourceInsertSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				update: TOperations['update'] extends true | CrudOperationUpdate<
					THeaderSchema,
					TSourceUpdateSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				updateOne: TOperations['updateOne'] extends true | CrudOperationUpdateOne<
					THeaderSchema,
					TSourceUpdateSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				delete: TOperations['delete'] extends true | CrudOperationDelete<
					THeaderSchema,
					TSourceDeleteSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				deleteOne: TOperations['deleteOne'] extends true | CrudOperationDeleteOne<
					THeaderSchema,
					TSourceDeleteSchema,
					TSourceResponseSchema
				>
					? true
					: false,
				count: TOperations['count'] extends true | CrudOperationCount<
					THeaderSchema,
					TSourceCountSchema,
					TSourceResponseSchema
				>
					? true
					: false
			},
			TSourceInsertSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> & (
			TDatabase extends string
				? {}
				: {
					ResolveDbHeader: TObject<{
						'database-using': TString;
					}>
				}
		);
		error: {};
	}
>;