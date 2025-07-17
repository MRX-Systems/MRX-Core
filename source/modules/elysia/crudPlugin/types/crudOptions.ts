import type { TObject } from '@sinclair/typebox';

import type { DbSelectorOptions } from '#/modules/elysia/dbSelectorPlugin/types/dbSelectorOptions';
import type { CrudOperationsOptions } from './crudOperationsOptions';
import type { CrudSourceSchemasOptions } from './crudSourceSchemasOptions';

/**
 * Options for the CRUD plugin
 *
 * @template TSourceSchema - The type of the object to be used in the CRUD operations extending {@link TObject}
 * @template KEnumPermission - The type of the enum for permissions extending {@link String}
 */
export interface CrudOptions<
	TDatabase extends string | DbSelectorOptions,
	TTableName extends string,
	TSourceSchema extends TObject,
	TSourceSearchSchema extends TObject,
	TSourceInsertSchema extends TObject,
	TSourceUpdateSchema extends TObject,
	TSourceResponseSchema extends TObject,
	TSourceSchemas extends CrudSourceSchemasOptions<
		TSourceSchema,
		TSourceSearchSchema,
		TSourceInsertSchema,
		TSourceUpdateSchema,
		TSourceResponseSchema
	>,
	TOperations extends CrudOperationsOptions
> {
	readonly database: TDatabase;
	readonly tableName: TTableName;
	readonly schema: TSourceSchemas;
	readonly operations?: TOperations;
}