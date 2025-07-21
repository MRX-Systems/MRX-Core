import type { TObject } from '@sinclair/typebox/type';

import type { CrudSchemaOperations } from './crudSchemaOperations';

export interface CrudSchemaOptions<
	TSourceSchemaName extends string,
	TSourceSchema extends TObject,
	TSourceInsertSchema extends TObject = TSourceSchema,
	TSourceFindSchema extends TObject = TSourceSchema,
	TSourceCountSchema extends TObject = TSourceSchema,
	TSourceUpdateSchema extends TObject = TSourceSchema,
	TSourceDeleteSchema extends TObject = TSourceSchema,
	TSourceResponseSchema extends TObject = TSourceSchema,
	TOperations extends CrudSchemaOperations = CrudSchemaOperations
> {
	readonly sourceSchemaName: TSourceSchemaName;
	readonly sourceSchema: TSourceSchema;
	readonly sourceFindSchema?: TSourceFindSchema;
	readonly sourceCountSchema?: TSourceCountSchema;
	readonly sourceInsertSchema?: TSourceInsertSchema;
	readonly sourceUpdateSchema?: TSourceUpdateSchema;
	readonly sourceDeleteSchema?: TSourceDeleteSchema;
	readonly sourceResponseSchema?: TSourceResponseSchema;
	readonly operations?: TOperations;
}