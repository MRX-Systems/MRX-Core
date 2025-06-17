import type {
    Static,
    TObject,
    TUnion
} from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import type { QueryOptionsBuilderOptions } from './types/queryOptionsBuilderOptions';
import { createAdaptiveWhereClauseSchema } from './utils/createAdaptiveWhereClauseSchema';
import { createOrderBySchema } from './utils/createOrderBySchema';
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
const _createPropertiesSchema = <TInferedObject extends TObject>(schema: TInferedObject) => {
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
            createAdaptiveWhereClauseSchema(propertySchema), // Array of where clauses: [{ $gt: 18 }, { $lt: 65 }]
            propertySchema // Array of values: ["john", "jane"]
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
const _createFiltersSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Composite([
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
const _createSearchSchema = <TInferedObject extends TObject>(schema: TInferedObject) => {
    const sanitizedSchema = filterByKeyExclusionRecursive(
        schema,
        [
            'minLength',
            'maxLength',
            'pattern',
            'format',
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
            orderBy: createOrderBySchema(sanitizedSchema),
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
>({
    schemaName,
    baseSchema
}: QueryOptionsBuilderOptions<TSchemaName, TInferedObject>) => new Elysia({
    name: `queryOptionsBuilderPlugin-${schemaName}`,
    seed: baseSchema
})
    .model((`${schemaName}Search` as const), _createSearchSchema(baseSchema))
    .as('scoped');