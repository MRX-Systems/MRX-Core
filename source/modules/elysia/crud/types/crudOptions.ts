import type { TObject } from '@sinclair/typebox';

import type { DynamicDbOptions } from '#/modules/elysia/dbResolver/types/dynamicDbOptions';
import type { CrudOperationsOptions } from './crudOperationsOptions';

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
	TOperations extends CrudOperationsOptions,
	TSourceFindSchema extends TObject = TSourceSchema,
	TSourceCountSchema extends TObject = TSourceSchema,
	TSourceInsertSchema extends TObject = TSourceSchema,
	TSourceUpdateSchema extends TObject = TSourceSchema,
	TSourceDeleteSchema extends TObject = TSourceSchema,
	TSourceResponseSchema extends TObject = TSourceSchema
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
}