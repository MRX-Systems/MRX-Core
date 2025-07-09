import type { TObject } from '@sinclair/typebox';

export interface QueryOptionsBuilderOptions<
	TSchemaName extends string,
	TInferedObject extends TObject
> {
	/**
	 * The name of the schema to be used for referencing the query options model.
	 */
	readonly schemaName: TSchemaName;
	/**
	 * The base schema that defines the structure of the query options model.
	 */
	readonly baseSchema: TInferedObject;
}