import type {
	Static,
	TArray,
	TComposite,
	TNumber,
	TObject,
	TPartial,
	TUnion
} from '@sinclair/typebox';
import { Elysia, t, type MetadataBase, type RouteBase, type SingletonBase } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import type { EphemeralType, MergeSchema, Prettify, PrettifySchema } from 'elysia/types';
import type { QSchema } from './types/qSchema';
import type { QueryOptionsBuilderOptions } from './types/queryOptionsBuilderOptions';
import { createAdaptiveWhereClauseSchema } from './utils/createAdaptiveWhereClauseSchema';
import { createOrderSchema } from './utils/createOrderSchema';
import { createQSchema } from './utils/createQSchema';
import { createSelectedFieldsSchema } from './utils/createSelectedFieldsSchema';

/**
 * Creates property schemas.
 *
 * @template TInferedObject - The TypeBox object schema to create property schemas for
 *
 * @param schema - The base object schema to create property schemas for.
 *
 * @returns Record of property schemas with union types
 */
const _createPropertiesSchema = <TInferedObject extends TObject>(schema: TInferedObject): TObject<{
	[K in keyof Static<TInferedObject>]: TUnion<[
		ReturnType<typeof createAdaptiveWhereClauseSchema<TInferedObject['properties'][K]>>,
		TInferedObject['properties'][K]
	]>
}> => {
	const { properties } = schema;
	const clauseSchema = {} as {
		[K in keyof Static<TInferedObject>]: TUnion<[
			ReturnType<typeof createAdaptiveWhereClauseSchema<TInferedObject['properties'][K]>>,
			TInferedObject['properties'][K]
		]>
	};
	for (const [key, propertySchema] of Object.entries(properties))
	// @ts-expect-error // Generic can't be indexed
		clauseSchema[key] = t.Union([
			createAdaptiveWhereClauseSchema(propertySchema),
			propertySchema
		]);
	return t.Object(clauseSchema);
};

/**
 * Creates a filters schema that combines search queries and property filters.
 *
 * @template TInferedObject - The TypeBox object schema to create filters for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create filters for.
 *
 * @returns A TypeBox object schema for filters
 */
const _createFiltersSchema = <TInferedObject extends TObject>(schema: TInferedObject): TComposite<[
	TObject<{
		$q: QSchema<TInferedObject>
	}>,
	ReturnType<typeof _createPropertiesSchema<TInferedObject>>
]> => t.Composite([
	t.Object({
		$q: createQSchema(schema)
	}),
	_createPropertiesSchema(schema)
]);

/**
 * Creates a search schema.
 *
 * @template TInferedObject - The TypeBox object schema to create search capabilities for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create search schemas for.
 *
 * @returns A TypeBox object schema for search with selected fields, order by, filters, limit, and offset
 */
const _createSearchSchema = <TInferedObject extends TObject>(schema: TInferedObject): TPartial<TObject<{
	queryOptions: TPartial<TObject<{
		selectedFields: ReturnType<typeof createSelectedFieldsSchema>;
		orderBy: ReturnType<typeof createOrderSchema>;
		filters: TUnion<[
			TPartial<ReturnType<typeof _createFiltersSchema<TInferedObject>>>,
			TArray<TPartial<ReturnType<typeof _createFiltersSchema<TInferedObject>>>>
		]>;
		limit: TNumber;
		offset: TNumber;
	}>>
}>> => {
	const sanitizedSchema = filterByKeyExclusionRecursive(
		schema,
		[
			'minLength',
			'maxLength',
			'pattern',
			// 'format', // removed because t.date needs it
			'minimum',
			'maximum',
			'exclusiveMinimum',
			'exclusiveMaximum',
			'multipleOf',
			'minItems',
			'maxItems',
			'maxContains',
			'minContains',
			'minProperties',
			'maxProperties',
			'uniqueItems',
			'minimumTimestamp',
			'maximumTimestamp',
			'exclusiveMinimumTimestamp',
			'exclusiveMaximumTimestamp',
			'multipleOfTimestamp',
			'required',
			'examples',
			'example',
			'default',
			'title',
			'description'
		]
	) as TInferedObject;

	return t.Partial(t.Object({
		queryOptions: t.Partial(t.Object({
			selectedFields: createSelectedFieldsSchema(sanitizedSchema),
			orderBy: createOrderSchema(sanitizedSchema),
			filters: t.Union([
				t.Partial(_createFiltersSchema(sanitizedSchema)),
				t.Array(t.Partial(_createFiltersSchema(sanitizedSchema)))
			]),
			limit: t.Number({
				description: 'Maximum number of results to return',
				default: 100,
				minimum: 1
			}),
			offset: t.Number({
				description: 'Number of results to skip before starting to collect the result set',
				default: 0,
				minimum: 0
			})
		}))
	}));
};

/**
 * The `queryOptionsBuilderPlugin` provides a model allowing the addition of QueryOptions
 * to the request body, which can be used in `Repository`.
 *
 * @param options - Configuration options for the plugin
 *
 * @returns Configured Elysia plugin with a search model
 */
export const queryOptionsBuilderPlugin = <
	const TSchemaName extends string,
	TInferedObject extends TObject
>(
	{
		schemaName,
		baseSchema
	}: QueryOptionsBuilderOptions<TSchemaName, TInferedObject>
): Elysia<
	TSchemaName,
	SingletonBase,
	{
		typebox: Record<`${TSchemaName}Search`, ReturnType<typeof _createSearchSchema<TInferedObject>>>;
		error: {};
	},
	MetadataBase,
	RouteBase,
	{
		derive: Prettify<EphemeralType['derive']>;
		resolve: Prettify<EphemeralType['resolve']>;
		schema: MergeSchema<EphemeralType['schema'], EphemeralType['schema']>;
		standaloneSchema: PrettifySchema<EphemeralType['standaloneSchema']>;
	},
	{
		derive: {};
		resolve: {};
		schema: {};
		standaloneSchema: {};
	}
> => new Elysia<TSchemaName>({
	name: `queryOptionsBuilderPlugin-${schemaName}`,
	seed: baseSchema
})
	.model((`${schemaName}Search` as const), _createSearchSchema(baseSchema))
	.as('scoped');