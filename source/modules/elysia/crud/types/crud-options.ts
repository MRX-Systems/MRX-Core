import type { TObject, TString } from '@sinclair/typebox/type';

import type { DynamicDbOptions } from '#/modules/elysia/db-resolver/types/dynamic-db-options';
import type { CrudOperationCount } from './crud-operation-count';
import type { CrudOperationDelete } from './crud-operation-delete';
import type { CrudOperationDeleteOne } from './crud-operation-delete-one';
import type { CrudOperationFind } from './crud-operation-find';
import type { CrudOperationFindOne } from './crud-operation-find-one';
import type { CrudOperationInsert } from './crud-operation-insert';
import type { CrudOperationUpdate } from './crud-operation-update';
import type { CrudOperationUpdateOne } from './crud-operation-update-one';
import type { CrudOperations } from './crud-operations';

/**
 * Options for the CRUD plugin
 *
 * @template TSourceSchema - The type of the object to be used in the CRUD operations extending {@link TObject}
 * @template KEnumPermission - The type of the enum for permissions extending {@link String}
 */
export interface CrudOptions<
	TDatabase extends DynamicDbOptions | string,
	TTableName extends string,
	TSourceSchema extends TObject,
	TSourceFindSchema extends TObject = TSourceSchema,
	TSourceCountSchema extends TObject = TSourceSchema,
	TSourceInsertSchema extends TObject = TSourceSchema,
	TSourceUpdateSchema extends TObject = TSourceSchema,
	TSourceDeleteSchema extends TObject = TSourceSchema,
	TSourceResponseSchema extends TObject = TSourceSchema,
	THeaderSchema extends TObject = (
		TDatabase extends string
			? TObject<{}>
			: TObject<{
				'database-using': TString;
			}>
	),
	TOperations extends CrudOperations<
		THeaderSchema,
		TSourceSchema,
		TSourceFindSchema,
		TSourceCountSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceDeleteSchema,
		TSourceResponseSchema
	> = {
		find?: CrudOperationFind<
			THeaderSchema,
			TSourceFindSchema,
			TSourceResponseSchema
		> | true,
		findOne?: CrudOperationFindOne<
			THeaderSchema,
			TSourceResponseSchema
		> | true,
		insert?: CrudOperationInsert<
			THeaderSchema,
			TSourceInsertSchema,
			TSourceResponseSchema
		> | true,
		update?: CrudOperationUpdate<
			THeaderSchema,
			TSourceUpdateSchema,
			TSourceResponseSchema
		> | true,
		updateOne?: CrudOperationUpdateOne<
			THeaderSchema,
			TSourceUpdateSchema,
			TSourceResponseSchema
		> | true,
		delete?: CrudOperationDelete<
			THeaderSchema,
			TSourceDeleteSchema,
			TSourceResponseSchema
		> | true,
		deleteOne?: CrudOperationDeleteOne<
			THeaderSchema,
			TSourceResponseSchema
		> | true,
		count?: CrudOperationCount<
			THeaderSchema,
			TSourceCountSchema
		> | true
	}
> {
	readonly database: TDatabase;
	readonly tableName: TTableName;
	readonly schema: {
		readonly sourceSchema: TSourceSchema;
		readonly sourceFindSchema?: TSourceFindSchema;
		readonly sourceCountSchema?: TSourceCountSchema;
		readonly sourceInsertSchema?: TSourceInsertSchema;
		readonly sourceUpdateSchema?: TSourceUpdateSchema;
		readonly sourceDeleteSchema?: TSourceDeleteSchema;
		readonly sourceResponseSchema?: TSourceResponseSchema;
	};
	readonly operations?: TOperations;
	readonly tags?: string[];
	readonly prefix?: string;
}