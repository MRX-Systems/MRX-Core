/* eslint-disable complexity */
import type { TObject, TString } from '@sinclair/typebox';
import { Elysia, type SingletonBase } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import { crudSchema } from '#/modules/elysia/crud/crud-schema';
import type { CrudSchemaModelsType } from '#/modules/elysia/crud/types/crud-schema-models-type';
import { dbResolver } from '#/modules/elysia/db-resolver/db-resolver';
import type { DynamicDbOptions } from '#/modules/elysia/db-resolver/types/dynamic-db-options';
import { count } from './operations/count';
import { batchDelete } from './operations/delete';
import { deleteOne } from './operations/deleteOne';
import { find } from './operations/find';
import { findOne } from './operations/findOne';
import { insert } from './operations/insert';
import { update } from './operations/update';
import { updateOne } from './operations/updateOne';
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
			TSourceResponseSchema
		> | true,
		count: CrudOperationCount<
			THeaderSchema,
			TSourceCountSchema
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
					TSourceResponseSchema
				>
					? true
					: false,
				count: TOperations['count'] extends true | CrudOperationCount<
					THeaderSchema,
					TSourceCountSchema
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
> => {
	const app = new Elysia({
		name: `crudPlugin[${tableName}]`,
		tags,
		prefix
	})
		// Plugin to inject dynamic or static db in context
		.use(dbResolver<TDatabase>(database))

		// Plugin to add global templates to Elysia based on defined operations
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
						TSourceResponseSchema
					>
						? true
						: false,
					count: TOperations['count'] extends true | CrudOperationCount<
						THeaderSchema,
						TSourceCountSchema
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
						TSourceResponseSchema
					>
						? true
						: false,
					count: (operations.count ? true : false) as TOperations['count'] extends true | CrudOperationCount<
						THeaderSchema,
						TSourceCountSchema
					>
						? true
						: false
				}
			})
		);

	const requiredHeaderDatabase = typeof database === 'object'
		? { headers: 'dbResolverHeader' } as const // Header required for dynamic database selection
		: {} as const; // No header needed for static database

	/**
	 * Helper function to create hook configuration for CRUD operations
	 */
	const createHookConfig = (operation: unknown) => ({
		hook: {
			...requiredHeaderDatabase,
			...(typeof operation === 'object' && operation && 'hook' in operation ? (operation as { hook?: Record<string, unknown> }).hook || {} : {})
		}
	});

	// Register CRUD operations
	if (operations.insert)
		app.use(insert<THeaderSchema, TSourceInsertSchema, TSourceResponseSchema>(
			tableName,
			createHookConfig(operations.insert)
		));

	if (operations.find)
		app.use(find<THeaderSchema, TSourceFindSchema, TSourceResponseSchema>(
			tableName,
			createHookConfig(operations.find)
		));

	if (operations.findOne)
		app.use(findOne<THeaderSchema, TSourceResponseSchema>(
			tableName,
			createHookConfig(operations.findOne)
		));

	if (operations.update)
		app.use(update<THeaderSchema, TSourceUpdateSchema, TSourceResponseSchema>(
			tableName,
			createHookConfig(operations.update)
		));

	if (operations.updateOne)
		app.use(updateOne<THeaderSchema, TSourceUpdateSchema, TSourceResponseSchema>(
			tableName,
			createHookConfig(operations.updateOne)
		));

	if (operations.delete)
		app.use(batchDelete<THeaderSchema, TSourceDeleteSchema, TSourceResponseSchema>(
			tableName,
			createHookConfig(operations.delete)
		));

	if (operations.deleteOne)
		app.use(deleteOne<THeaderSchema, TSourceResponseSchema>(
			tableName,
			createHookConfig(operations.deleteOne)
		));

	if (operations.count)
		app.use(count<THeaderSchema, TSourceCountSchema>(
			tableName,
			createHookConfig(operations.count)
		));

	return app as unknown as Elysia<
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
						TSourceResponseSchema
					>
						? true
						: false,
					count: TOperations['count'] extends true | CrudOperationCount<
						THeaderSchema,
						TSourceCountSchema
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
};