import type { TObject } from '@sinclair/typebox';

export interface QueryOptionsBuilderOptions<
	TSourceSchemaName extends string,
	TSourceSchema extends TObject
> {
	/**
	 * The name of the schema to be used for referencing the query options model.
	 */
	readonly sourceSchemaName: TSourceSchemaName;
	/**
	 * The source schema that defines the structure of the query options model.
	 */
	readonly sourceSchema: TSourceSchema;
}