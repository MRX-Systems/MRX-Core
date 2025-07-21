import type {
	TObject
} from '@sinclair/typebox';
import { Elysia } from 'elysia';

import { crudSchemaPlugin } from '#/modules/elysia/crudSchemaPlugin/crudSchema';
import type { DbSelectorOptions } from '#/modules/elysia/dbSelectorPlugin/types/dbSelectorOptions';
import type { CrudOperationsOptions } from './types/crudOperationsOptions';
import type { CrudOptions } from './types/crudOptions';

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
	const TSourceFindSchema extends TObject = TSourceSchema,
	const TSourceCountSchema extends TObject = TSourceSchema,
	const TSourceInsertSchema extends TObject = TSourceSchema,
	const TSourceUpdateSchema extends TObject = TSourceSchema,
	const TSourceDeleteSchema extends TObject = TSourceSchema,
	const TSourceResponseSchema extends TObject = TSourceSchema
> (
	{
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
		TSourceFindSchema,
		TSourceCountSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceDeleteSchema,
		TSourceResponseSchema
	>
) => new Elysia({
	name: `crudPlugin[${tableName}]`,
	tags: [tableName]
})
	.use(
		crudSchemaPlugin({
			sourceSchemaName: tableName,
			sourceSchema: schema.sourceSchema,
			sourceInsertSchema: schema.sourceInsertSchema as TSourceInsertSchema || schema.sourceSchema as unknown as TSourceInsertSchema,
			sourceFindSchema: schema.sourceFindSchema as TSourceFindSchema || schema.sourceSchema as unknown as TSourceFindSchema,
			sourceCountSchema: schema.sourceCountSchema as TSourceCountSchema || schema.sourceSchema as unknown as TSourceCountSchema,
			sourceUpdateSchema: schema.sourceUpdateSchema as TSourceUpdateSchema || schema.sourceSchema as unknown as TSourceUpdateSchema,
			sourceDeleteSchema: schema.sourceDeleteSchema as TSourceDeleteSchema || schema.sourceSchema as unknown as TSourceDeleteSchema,
			sourceResponseSchema: schema.sourceResponseSchema as TSourceResponseSchema || schema.sourceSchema as unknown as TSourceResponseSchema,
			operations: {
				find: operations.find ? true : false,
				findOne: operations.findOne ? true : false,
				insert: operations.insert ? true : false,
				update: operations.update ? true : false,
				updateOne: operations.updateOne ? true : false,
				delete: operations.delete ? true : false,
				deleteOne: operations.deleteOne ? true : false,
				count: operations.count ? true : false
			}
		})
	);