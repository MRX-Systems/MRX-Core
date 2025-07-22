import type {
	TObject,
	TString
} from '@sinclair/typebox';
import { Elysia, type SingletonBase } from 'elysia';

import type { MSSQL } from '#/modules/database/mssql';
import { crudSchemaPlugin } from '#/modules/elysia/crudSchemaPlugin/crudSchema';
import type { CrudModelsType } from '#/modules/elysia/crudSchemaPlugin/types/crudModelsType';
import { dbResolverPlugin } from '#/modules/elysia/dbResolverPlugin/dbResolver';
import type { DynamicDbOptions } from '#/modules/elysia/dbResolverPlugin/types/dynamicDbOptions';
import type { CrudOperationCountOptions } from './types/crudOperationCountOptions';
import type { CrudOperationDeleteOneOptions } from './types/crudOperationDeleteOneOptions';
import type { CrudOperationDeleteOptions } from './types/crudOperationDeleteOptions';
import type { CrudOperationFindOneOptions } from './types/crudOperationFindOneOptions';
import type { CrudOperationFindOptions } from './types/crudOperationFindOptions';
import type { CrudOperationInsertOptions } from './types/crudOperationInsertOptions';
import type { CrudOperationsOptions } from './types/crudOperationsOptions';
import type { CrudOperationUpdateOneOptions } from './types/crudOperationUpdateOneOptions';
import type { CrudOperationUpdateOptions } from './types/crudOperationUpdateOptions';
import type { CrudOptions } from './types/crudOptions';

export const crudPlugin = <
	const TDatabase extends DynamicDbOptions<THeaderKeyName> | string,
	const TTableName extends string,
	const TSourceSchema extends TObject,
	const THeaderKeyName extends string = 'database-using',
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
	const TSourceFindSchema extends TObject = TSourceSchema,
	const TSourceCountSchema extends TObject = TSourceSchema,
	const TSourceInsertSchema extends TObject = TSourceSchema,
	const TSourceUpdateSchema extends TObject = TSourceSchema,
	const TSourceDeleteSchema extends TObject = TSourceSchema,
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
		THeaderKeyName,
		TOperations,
		TSourceFindSchema,
		TSourceCountSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceDeleteSchema,
		TSourceResponseSchema
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
		typebox: CrudModelsType<
			TTableName,
			{
				find: TOperations['find'] extends true | CrudOperationFindOptions
					? true
					: false,
				findOne: TOperations['findOne'] extends true | CrudOperationFindOneOptions
					? true
					: false,
				insert: TOperations['insert'] extends true | CrudOperationInsertOptions
					? true
					: false,
				update: TOperations['update'] extends true | CrudOperationUpdateOptions
					? true
					: false,
				updateOne: TOperations['updateOne'] extends true | CrudOperationUpdateOneOptions
					? true
					: false,
				delete: TOperations['delete'] extends true | CrudOperationDeleteOptions
					? true
					: false,
				deleteOne: TOperations['deleteOne'] extends true | CrudOperationDeleteOneOptions
					? true
					: false,
				count: TOperations['count'] extends true | CrudOperationCountOptions
					? true
					: false
			},
			TSourceInsertSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> & {
			ResolveDbHeader: TObject<Record<THeaderKeyName, TString>>
		};
		error: {};
	}
> => new Elysia({
	name: `crudPlugin[${tableName}]`,
	tags: [tableName]
})
	.use(
		dbResolverPlugin<
			TDatabase,
			THeaderKeyName
		>(database)
	)
	.use(
		crudSchemaPlugin<
			TTableName,
			TSourceSchema,
			TSourceInsertSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema,
			{
				find: TOperations['find'] extends true | CrudOperationFindOptions
					? true
					: false,
				findOne: TOperations['findOne'] extends true | CrudOperationFindOneOptions
					? true
					: false,
				insert: TOperations['insert'] extends true | CrudOperationInsertOptions
					? true
					: false,
				update: TOperations['update'] extends true | CrudOperationUpdateOptions
					? true
					: false,
				updateOne: TOperations['updateOne'] extends true | CrudOperationUpdateOneOptions
					? true
					: false,
				delete: TOperations['delete'] extends true | CrudOperationDeleteOptions
					? true
					: false,
				deleteOne: TOperations['deleteOne'] extends true | CrudOperationDeleteOneOptions
					? true
					: false,
				count: TOperations['count'] extends true | CrudOperationCountOptions
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
				find: (operations.find ? true : false) as TOperations['find'] extends true | CrudOperationFindOptions
					? true
					: false,
				findOne: (operations.findOne ? true : false) as TOperations['findOne'] extends true | CrudOperationFindOneOptions
					? true
					: false,
				insert: (operations.insert ? true : false) as TOperations['insert'] extends true | CrudOperationInsertOptions
					? true
					: false,
				update: (operations.update ? true : false) as TOperations['update'] extends true | CrudOperationUpdateOptions
					? true
					: false,
				updateOne: (operations.updateOne ? true : false) as TOperations['updateOne'] extends true | CrudOperationUpdateOneOptions
					? true
					: false,
				delete: (operations.delete ? true : false) as TOperations['delete'] extends true | CrudOperationDeleteOptions
					? true
					: false,
				deleteOne: (operations.deleteOne ? true : false) as TOperations['deleteOne'] extends true | CrudOperationDeleteOneOptions
					? true
					: false,
				count: (operations.count ? true : false) as TOperations['count'] extends true | CrudOperationCountOptions
					? true
					: false
			}
		})
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
		typebox: CrudModelsType<
			TTableName,
			{
				find: TOperations['find'] extends true | CrudOperationFindOptions
					? true
					: false,
				findOne: TOperations['findOne'] extends true | CrudOperationFindOneOptions
					? true
					: false,
				insert: TOperations['insert'] extends true | CrudOperationInsertOptions
					? true
					: false,
				update: TOperations['update'] extends true | CrudOperationUpdateOptions
					? true
					: false,
				updateOne: TOperations['updateOne'] extends true | CrudOperationUpdateOneOptions
					? true
					: false,
				delete: TOperations['delete'] extends true | CrudOperationDeleteOptions
					? true
					: false,
				deleteOne: TOperations['deleteOne'] extends true | CrudOperationDeleteOneOptions
					? true
					: false,
				count: TOperations['count'] extends true | CrudOperationCountOptions
					? true
					: false
			},
			TSourceInsertSchema,
			TSourceFindSchema,
			TSourceCountSchema,
			TSourceUpdateSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> & {
			ResolveDbHeader: TObject<Record<THeaderKeyName, TString>>
		};
		error: {};
	}
>;