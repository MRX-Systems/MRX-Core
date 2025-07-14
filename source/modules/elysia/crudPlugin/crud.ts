import { TypeGuard, type Static, type TLiteral, type TObject, type TUndefined, type TUnion } from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import { CoreError } from '#/error/coreError';
import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import { MSSQL } from '#/modules/database';
import { errorKeys } from '#/modules/elysia/dbSelectorPlugin/enums/errorKeys';
import type { DbSelectorOptions } from '#/modules/elysia/dbSelectorPlugin/types/dbSelectorOptions';
import { queryOptionsBuilderPlugin } from '#/modules/elysia/queryOptionsBuilderPlugin/queryOptionsBuilder';
import { SingletonManager } from '#/modules/singletonManager/singletonManager';
import type { CrudModelsType } from './types/crudModelsType';
import type { CrudOperationBaseOptions } from './types/crudOperationBaseOptions';
import type { CrudOperations } from './types/crudOpterations';
import type { CrudOptions } from './types/crudOptions';

const _createResponse200Schema = <TInferedObject extends TObject>(schema: TInferedObject) => {
	const sanitizedSchema = filterByKeyExclusionRecursive(
		schema,
		[
			'minLength',
			'maxLength',
			'pattern',
			'format',
			'minimum',
			'maximum',
			'exclusiveMinimum',
			'exclusiveMaximum',
			'multipleOf',
			'minItems',
			'maxItems',
			'maxContains',
			'minContains',
			'minProperties',
			'maxProperties',
			'uniqueItems',
			'minimumTimestamp',
			'maximumTimestamp',
			'exclusiveMinimumTimestamp',
			'exclusiveMaximumTimestamp',
			'multipleOfTimestamp',
			'required',
			'default'
		]
	) as TInferedObject;

	const { properties } = sanitizedSchema;

	const responseSchema = {} as {
		[K in keyof Static<TInferedObject>]: TUnion<[
			TUndefined,
			TLiteral<''>,
			TInferedObject['properties'][K]
		]>
	};

	for (const key in properties)
	// @ts-expect-error - Generic can't be indexed
		responseSchema[key] = TypeGuard.IsString(properties[key])
			? t.Union([properties[key], t.Undefined(), t.Literal(''), t.Null()])
			: t.Union([properties[key], t.Undefined(), t.Null()]);

	return t.Object({
		message: t.String(),
		content: t.Array(t.Partial(t.Object(responseSchema)))
	});
};

const _createCountResponse200Schema = () => t.Object({
	message: t.String(),
	content: t.Number()
});

const _createIdParamSchema = () => t.Object({
	id: t.Union([t.String(), t.Number()])
});

const _addModels = <
	const TTableName extends string,
	const TInferedObject extends TObject,
	const TDatabase extends string | DbSelectorOptions,
	const TOperations extends CrudOperations<TInferedObject> = CrudOperations<TInferedObject>
>(
	tableName: TTableName,
	schema: TInferedObject,
	database: TDatabase,
	operations: TOperations
) => {
	const plugin = new Elysia();

	const models: Record<string, unknown> = {
		...(operations.insert
			? { [`${tableName}Insert`]: t.Union([
				schema,
				t.Array(schema, {
					minItems: 1,
					uniqueItems: true
				})
			]) }
			: {}),
		...(operations.update ? { [`${tableName}Update`]: t.Partial(schema) } : {}),
		...(operations.updateOne ? { [`${tableName}UpdateOne`]: t.Partial(schema) } : {})
	};

	if (
		operations.find
		|| operations.update
		|| operations.delete
		|| operations.count
	)
		plugin.use(queryOptionsBuilderPlugin({
			schemaName: tableName,
			baseSchema: schema
		}));

	if (
		operations.findOne
		|| operations.updateOne
		|| operations.deleteOne
	)
		models[`${tableName}IdParam`] = _createIdParamSchema();

	if (
		operations.find
		|| operations.findOne
		|| operations.insert
		|| operations.update
		|| operations.updateOne
		|| operations.delete
		|| operations.deleteOne
	)
		models[`${tableName}Response200`] = _createResponse200Schema(schema);

	if (operations.count)
		models[`${tableName}CountResponse200`] = _createCountResponse200Schema();

	if (typeof database === 'object')
		models['dbSelectorHeader'] = t.Object({
			[database.headerKey || 'database-using']: t.String({
				description: 'Name of the database to use for the request',
				example: 'my_database'
			})
		});

	return plugin.model(models as CrudModelsType<
		TTableName,
		TInferedObject,
		TDatabase,
		TOperations
	>);
};

/**
 * Internal function to resolve database connection based on configuration type (static or dynamic)
 *
 * @param database - Database configuration (string for static, DbSelectorOptions for dynamic)
 * @param headers - Request headers containing database selection information
 *
 * @throws ({@link CoreError}): When database header key is not found in dynamic mode
 *
 * @returns Database instance wrapped in appropriate record type
 */
const _resolveDatabaseConnection = async <TDatabase extends string | DbSelectorOptions>(
	database: TDatabase,
	headers: Record<string, string | undefined>
): Promise<Record<TDatabase extends string ? 'staticDB' : 'dynamicDB', MSSQL>> => {
	// Static database case - database name is provided as string
	if (typeof database === 'string')
		return {
			staticDB: SingletonManager.get<MSSQL>(`database:${database}`)
		} as Record<TDatabase extends string ? 'staticDB' : 'dynamicDB', MSSQL>;

	// Dynamic database case - database selected via header
	const databaseName = headers[database.headerKey || 'database-using'];

	if (!databaseName)
		throw new CoreError({
			key: errorKeys.dbSelectorHeaderKeyNotFound,
			message: 'Database Selector key not found in the request headers.',
			httpStatusCode: 400
		});

	// Register and connect database if not already available
	if (!SingletonManager.has(`database:${databaseName}`)) {
		SingletonManager.register(`database:${databaseName}`, MSSQL, {
			...database.connectionConfig,
			databaseName
		});
		await SingletonManager.get<MSSQL>(`database:${databaseName}`).connect();
	}

	return {
		dynamicDB: SingletonManager.get<MSSQL>(`database:${databaseName}`)
	} as Record<TDatabase extends string ? 'staticDB' : 'dynamicDB', MSSQL>;
};

const _defaultOperationsWhithHandler: <
	const TTableName extends string,
	const TInferedObject extends TObject,
	const TDatabase extends string | DbSelectorOptions
>(tableName: TTableName, database: TDatabase) => Record<
	string,
	Required<Omit<CrudOperationBaseOptions<TInferedObject>, 'transform'>>
	& {
		handler: (ctx: Record<string, unknown>) => Promise<unknown>;
	}
> = <
	const TTableName extends string,
	const TDatabase extends string | DbSelectorOptions
>(
	tableName: TTableName,
	database: TDatabase
) => {
	const requiredHeaderDatabase = typeof database === 'object'
		? { headers: 'dbSelectorHeader' } as const // need header to select dynamic database
		: {} as const; // no header needed for static database
	return {
		find: {
			method: 'POST',
			path: '/search',
			hook: {
				...requiredHeaderDatabase,
				body: `${tableName}Search`,
				response: `${tableName}Response200`
			},
			handler: async (ctx: Record<string, unknown>) => {
				const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
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
				...requiredHeaderDatabase,
				params: `${tableName}IdParam`,
				response: `${tableName}Response200`
			},
			handler: async (ctx) => {
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
		insert: {
			method: 'POST',
			path: '/',
			hook: {
				...requiredHeaderDatabase,
				body: `${tableName}Insert`,
				response: `${tableName}Response200`
			},
			handler: async (ctx) => {
				const db = ctx.dynamicDB as MSSQL || ctx.staticDB as MSSQL;
				const { body } = ctx as {
					body: Partial<Record<string, unknown>> | Partial<Record<string, unknown>>[];
				};
				const data = await db.getRepository(tableName).insert(body, {
					throwIfNoResult: true
				});
				return {
					message: `Inserted record into ${tableName}`,
					content: data
				};
			}
		}
	};
};

const _addRouteByOperation = <
	const TTableName extends string,
	const TInferedObject extends TObject,
	const TDatabase extends string | DbSelectorOptions,
	const TOperations extends CrudOperations<TInferedObject>
>(
	tableName: TTableName,
	database: TDatabase,
	operations: TOperations
) => {
	const app = new Elysia();
	const defaultOps = _defaultOperationsWhithHandler<
		TTableName,
		TInferedObject,
		TDatabase
	>(tableName, database);

	for (const key in operations) {
		const op = operations[key as keyof TOperations];
		const defaultOp = defaultOps[key as keyof typeof defaultOps];

		if (!op || !defaultOp)
			continue;

		if (typeof op === 'boolean') {
			app.route(defaultOp.method, defaultOp.path, (ctx) => defaultOp.handler(ctx), defaultOp.hook as unknown as {});
		} else if (typeof op === 'object') {
			const mergedOp = {
				...defaultOp,
				...op
			};
			app.route(mergedOp.method, mergedOp.path, (ctx) => defaultOp.handler(ctx), mergedOp.hook as unknown as {});
		}
	}
	return app;
};

export const crudPlugin = <
	const TTableName extends string,
	const TInferedObject extends TObject,
	const TDatabase extends string | DbSelectorOptions,
	const TOperations extends CrudOperations<TInferedObject>
>({
	tableName,
	schema,
	database,
	operations = {
		find: true
		// findOne: true,
		// insert: true,
		// update: true,
		// updateOne: true,
		// delete: true,
		// deleteOne: true,
		// count: true
	} as TOperations
}: CrudOptions<
	TTableName,
	TInferedObject,
	TDatabase,
	TOperations
>) => {
	const app = new Elysia({
		name: `crudPlugin[${tableName}]`,
		tags: [tableName]
	})
		.use(_addModels(
			tableName,
			schema,
			database,
			operations
		))

		.resolve({ as: 'scoped' }, async ({ headers }): Promise<
			Record<
				TDatabase extends string
					? 'staticDB'
					: 'dynamicDB',
				MSSQL
			>
		> => _resolveDatabaseConnection(database, headers))

		.use(_addRouteByOperation<
			TTableName,
			TInferedObject,
			TDatabase,
			TOperations
		>(
			tableName,
			database,
			operations
		));
	return app;
};
