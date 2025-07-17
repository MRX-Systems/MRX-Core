/* eslint-disable @stylistic/no-tabs */
import {
	type Static,
	type TArray,
	type TLiteral,
	type TNumber,
	type TObject,
	type TPartial,
	type TString,
	type TUndefined,
	type TUnion,
	TypeGuard
} from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import { CoreError } from '#/error/coreError';
import { filterByKeyExclusionRecursive } from '#/modules/data';
import { MSSQL } from '#/modules/database';
import { errorKeys } from '#/modules/elysia/dbSelectorPlugin/enums/errorKeys';
import type { DbSelectorOptions } from '#/modules/elysia/dbSelectorPlugin/types/dbSelectorOptions';
import { SingletonManager } from '#/modules/singletonManager/singletonManager';
import { queryOptionsBuilderPlugin } from '../queryOptionsBuilderPlugin/queryOptionsBuilder';
import type { CrudModelsType } from './types/crudModelsType';
import type { CrudOperationsOptions } from './types/crudOperationsOptions';
import type { CrudOptions } from './types/crudOptions';

const _createResponse200Schema = <TSourceResponseSchema extends TObject>(schema: TSourceResponseSchema):
TObject<{
	message: TString;
	content: TArray<
		TPartial<
			TObject<{
				[K in keyof Static<TSourceResponseSchema>]: TUnion<[
					TUndefined,
					TLiteral<''>,
					TSourceResponseSchema['properties'][K]
				]>
			}>
		>
	>
}> => {
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
	) as TSourceResponseSchema;

	const { properties } = sanitizedSchema;

	const responseSchema = {} as {
		[K in keyof Static<TSourceResponseSchema>]: TUnion<[
			TUndefined,
			TLiteral<''>,
			TSourceResponseSchema['properties'][K]
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

const _createIdParamSchema = (): TObject<{ id: TUnion<[TString, TNumber]> }> => t.Object({
	id: t.Union([t.String(), t.Number()])
});

const _addModels = <
	const TDatabase extends string | DbSelectorOptions,
	const TTableName extends string,
	const TSourceSchema extends TObject,
	const TOperations extends CrudOperationsOptions,
	const TSourceSearchSchema extends TObject = TSourceSchema,
	const TSourceInsertSchema extends TObject = TSourceSchema,
	const TSourceUpdateSchema extends TObject = TSourceSchema,
	const TSourceResponseSchema extends TObject = TSourceSchema
>(
	tableName: TTableName,
	schema: CrudOptions<
		TDatabase,
		TTableName,
		TSourceSchema,
		TOperations,
		TSourceSearchSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceResponseSchema
	>['schema'],
	operations: TOperations
) => {
	const plugin = new Elysia();

	const models: Record<string, unknown> = {
		...(operations.insert
			? { [`${tableName}Insert`]: t.Union([
				schema.sourceInsertSchema as TSourceInsertSchema,
				t.Array(schema.sourceInsertSchema as TSourceInsertSchema, {
					minItems: 1,
					uniqueItems: true
				})
			]) }
			: {}
		),
		...(operations.update
			? { [`${tableName}Update`]: t.Partial(schema.sourceUpdateSchema as TSourceUpdateSchema) }
			: {}
		),
		...(operations.updateOne
			? { [`${tableName}UpdateOne`]: t.Partial(schema.sourceUpdateSchema as TSourceUpdateSchema) }
			: {}
		)
	};

	if (
		operations.find
		|| operations.update
		|| operations.delete
		|| operations.count
	)

		plugin.use(queryOptionsBuilderPlugin({
			sourceSchemaName: tableName,
			sourceSchema: schema.sourceSearchSchema as TSourceSearchSchema
		}));

	if (
		operations.findOne
		|| operations.updateOne
		|| operations.deleteOne
	)
		models[`${tableName}IdParam`] = _createIdParamSchema();

	if (operations.find
		|| operations.findOne
		|| operations.insert
		|| operations.update
		|| operations.updateOne
		|| operations.delete
		|| operations.deleteOne
	)
		models[`${tableName}Response200`] = _createResponse200Schema(schema.sourceResponseSchema as TSourceResponseSchema);

	if (operations.count)
		models[`${tableName}CountResponse200`] = _createCountResponse200Schema();

	return plugin.model(models as CrudModelsType<
		TDatabase,
		TTableName,
		TOperations,
		TSourceSearchSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceResponseSchema
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


export const crudPlugin = <
	const TDatabase extends string | DbSelectorOptions,
	const TTableName extends string,
	const TSourceSchema extends TObject,
	const TOperations extends CrudOperationsOptions = {
		find: true,
		findOne: true,
		insert: true,
		update: true,
		updateOne: true,
		delete: true,
		deleteOne: true,
		count: true
	},
	const TSourceSearchSchema extends TObject = TSourceSchema,
	const TSourceInsertSchema extends TObject = TSourceSchema,
	const TSourceUpdateSchema extends TObject = TSourceSchema,
	const TSourceResponseSchema extends TObject = TSourceSchema
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
		} as TOperations
	}: CrudOptions<
		TDatabase,
		TTableName,
		TSourceSchema,
		TOperations,
		TSourceSearchSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceResponseSchema
	>
) => {
	const app = new Elysia({
		name: `crudPlugin[${tableName}]`,
		tags: [tableName]
	})
		.use(
			_addModels(
				tableName,
				{
					sourceSchema: schema.sourceSchema,
					sourceSearchSchema: schema.sourceSearchSchema ?? schema.sourceSchema,
					sourceInsertSchema: schema.sourceInsertSchema ?? schema.sourceSchema,
					sourceUpdateSchema: schema.sourceUpdateSchema ?? schema.sourceSchema,
					sourceResponseSchema: schema.sourceResponseSchema ?? schema.sourceSchema
				},
				operations
			)
		)

		.resolve({ as: 'scoped' }, async ({ headers }): Promise<
			Record<
				TDatabase extends string
					? 'staticDB'
					: 'dynamicDB',
				MSSQL
			>
		> => _resolveDatabaseConnection(database, headers));
	return app;
};