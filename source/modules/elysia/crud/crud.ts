/* eslint-disable complexity */
import type { TObject, TString } from '@sinclair/typebox';
import { Elysia, type SingletonBase } from 'elysia';

import type { MSSQLDatabaseOptions } from '#/modules/database/types/mssql-database-option';
import { crudSchema } from '#/modules/elysia/crud/crud-schema';
import type { CrudSchemaModelsType } from '#/modules/elysia/crud/types/crud-schema-models-type';
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
	const TDatabase extends Omit<MSSQLDatabaseOptions, 'databaseName'> | string,
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
	SingletonBase,
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
		>;
		error: {};
	}
> => {
	const app = new Elysia({
		name: `crudPlugin[${tableName}]`,
		tags,
		prefix
	})
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

	// Register CRUD operations
	if (operations.insert)
		app.use(insert<
			TDatabase,
			TTableName,
			THeaderSchema,
			TSourceInsertSchema,
			TSourceResponseSchema
		>(
			database,
			tableName,
			operations.insert && typeof operations.insert === 'object'
				? operations.insert
				: {}
		));

	if (operations.find)
		app.use(find<
			TDatabase,
			TTableName,
			THeaderSchema,
			TSourceFindSchema,
			TSourceResponseSchema
		>(
			database,
			tableName,
			operations.find && typeof operations.find === 'object'
				? operations.find
				: {}
		));

	if (operations.findOne)
		app.use(findOne<
			TDatabase,
			TTableName,
			THeaderSchema,
			TSourceResponseSchema
		>(
			database,
			tableName,
			operations.findOne && typeof operations.findOne === 'object'
				? operations.findOne
				: {}
		));

	if (operations.update)
		app.use(update<
			TDatabase,
			TTableName,
			THeaderSchema,
			TSourceUpdateSchema,
			TSourceResponseSchema
		>(
			database,
			tableName,
			operations.update && typeof operations.update === 'object'
				? operations.update
				: {}
		));

	if (operations.updateOne)
		app.use(updateOne<
			TDatabase,
			TTableName,
			THeaderSchema,
			TSourceUpdateSchema,
			TSourceResponseSchema
		>(
			database,
			tableName,
			operations.updateOne && typeof operations.updateOne === 'object'
				? operations.updateOne
				: {}
		));

	if (operations.delete)
		app.use(batchDelete<
			TDatabase,
			TTableName,
			THeaderSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		>(
			database,
			tableName,
			operations.delete && typeof operations.delete === 'object'
				? operations.delete
				: {}
		));

	if (operations.deleteOne)
		app.use(deleteOne<
			TDatabase,
			TTableName,
			THeaderSchema,
			TSourceResponseSchema
		>(
			database,
			tableName,
			operations.deleteOne && typeof operations.deleteOne === 'object'
				? operations.deleteOne
				: {}
		));

	if (operations.count)
		app.use(count<
			TDatabase,
			TTableName,
			THeaderSchema,
			TSourceCountSchema
		>(
			database,
			tableName,
			operations.count && typeof operations.count === 'object'
				? operations.count
				: {}
		));

	return app as unknown as Elysia<
		TTableName,
		SingletonBase,
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
			>;
			error: {};
		}
	>;
};