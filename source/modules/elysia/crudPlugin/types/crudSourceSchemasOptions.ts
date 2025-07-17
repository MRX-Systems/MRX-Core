import type { TObject } from '@sinclair/typebox/type';

export interface CrudSourceSchemasOptions<
	TSourceSchema extends TObject,
	TSourceSearchSchema extends TObject,
	TSourceInsertSchema extends TObject,
	TSourceUpdateSchema extends TObject,
	TSourceResponseSchema extends TObject
> {
	readonly sourceSchema: TSourceSchema;
	readonly sourceSearchSchema?: TSourceSearchSchema;
	readonly sourceInsertSchema?: TSourceInsertSchema;
	readonly sourceUpdateSchema?: TSourceUpdateSchema;
	readonly sourceResponseSchema?: TSourceResponseSchema;
}