import {
    TypeGuard,
    type Static,
    type TObject,
    type TSchema,
    type TUnion
} from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import type { AdaptiveWhereClauseSchema } from './types/adaptiveWhereClauseSchema';
import type { QueryOptionsBuilderOptions } from './types/queryOptionsBuilderOptions';

/**
 * Creates a where clause schema with appropriate operators based on the property type.
 * Boolean properties get fewer operators than other types.
 *
 * @template TInferedSchema - The TypeBox schema to create where clauses for. Extends {@link TSchema}
 *
 * @param schema - The base property schema to create where clauses for. {@link TInferedSchema}
 *
 * @returns A TypeBox object schema with where clause operators
 */
const _createWhereClauseSchema = <TInferedSchema extends TSchema>(schema: TInferedSchema) => {
    // all
    const common = {
        $eq: schema,
        $neq: schema,
        $isNull: t.Boolean()
    } as const;

    // string, number, date
    const strNumDate = (TypeGuard.IsString(schema)
        || TypeGuard.IsNumber(schema)
        || TypeGuard.IsInteger(schema)
        || TypeGuard.IsDate(schema))
        ? {
            $in: t.Array(schema, { minItems: 1, uniqueItems: true }),
            $nin: t.Array(schema, { minItems: 1, uniqueItems: true }),
            $like: t.String(),
            $nlike: t.String()
        } as const
        : {};

    // number, date
    const numDate = (TypeGuard.IsNumber(schema)
        || TypeGuard.IsInteger(schema)
        || TypeGuard.IsDate(schema))
        ? {
            $lt: schema,
            $lte: schema,
            $gt: schema,
            $gte: schema,
            $between: t.Tuple([schema, schema]),
            $nbetween: t.Tuple([schema, schema])
        } as const
        : {};

    return t.Partial(t.Object({ ...common, ...strNumDate, ...numDate })) as unknown as AdaptiveWhereClauseSchema<TInferedSchema>;
};

/**
 * Creates property schemas.
 *
 * @template TInferedObject - The TypeBox object schema to create property schemas for
 *
 * @param schema - The base object schema to create property schemas for. {@link TInferedObject}
 *
 * @returns Record of property schemas with union types
 */
const _createPropertiesSchema = <TInferedObject extends TObject>(schema: TInferedObject) => {
    const { properties } = schema;
    const clauseSchema = {} as {
        [K in keyof Static<TInferedObject>]: TUnion<[
            ReturnType<typeof _createWhereClauseSchema<TInferedObject['properties'][K]>>,
            TInferedObject['properties'][K]
        ]>
    };
    for (const [key, propertySchema] of Object.entries(properties))
        // @ts-expect-error // Generic can't be indexed
        clauseSchema[key] = t.Union([
            _createWhereClauseSchema(propertySchema), // Array of where clauses: [{ $gt: 18 }, { $lt: 65 }]
            propertySchema // Array of values: ["john", "jane"]
        ]);
    return t.Object(clauseSchema);
};


/**
 * Creates a search query schema
 *
 * @template TInferedObject - The TypeBox object schema to create search queries for
 *
 * @param schema - The base object schema to create search queries for. {@link TInferedObject}
 *
 * @returns A union schema for search queries
 */
const _createQSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Union([
    t.Object({
        selectedFields: t.Array(t.Union([
            t.KeyOf(schema),
            t.Literal('*')
        ]), {
            description: 'Fields to select in the search results. Use "*" for all fields.',
            minItems: 1
        }),
        value: t.Union([
            t.Number(),
            t.String()
        ], {
            description: 'The search value to match against the selected fields.'
        })
    }),
    t.Number(),
    t.String()
]);

/**
 * Creates a filters schema that combines search queries and property filters.
 *
 * @template TInferedObject - The TypeBox object schema to create filters for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create filters for. {@link TInferedObject}
 *
 * @returns A TypeBox object schema for filters
 */
const _createFiltersSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Composite([
    t.Object({
        $q: _createQSchema(schema)
    }),
    _createPropertiesSchema(schema)
]);

/**
 * Creates a schema for field selection in search results.
 *
 * @template TInferedObject - The TypeBox object schema to create field selection for
 *
 * @param schema - The base object schema to create field selection for. {@link TInferedObject}
 *
 * @returns A TypeBox union schema for selected fields
 */
const _createSelectedFieldsSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Union([
    t.KeyOf(schema),
    t.Literal('*'),
    t.Array(t.Union([
        t.KeyOf(schema),
        t.Literal('*')
    ]), {
        minItems: 1
    })
], {
    description: 'Fields to select in the search results. Use "*" for all fields.',
    default: ['*']
});

/**
 * Creates a schema for order by clause in search results.
 *
 * @template TInferedObject - The TypeBox object schema to create order by for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create order by for. {@link TInferedObject}
 *
 * @returns A tuple schema with field name and direction
 */
const _createOrderBySchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Tuple([
    t.Extract(t.KeyOf(schema), t.String()),
    t.Union([t.Literal('asc'), t.Literal('desc')])
], {
    description: 'Field to order by and direction. Use "asc" for ascending or "desc" for descending order.'
});

/**
 * Creates a search schema.
 *
 * @template TInferedObject - The TypeBox object schema to create search capabilities for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create search schemas for. {@link TInferedObject}
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
            selectedFields: _createSelectedFieldsSchema(sanitizedSchema),
            orderBy: _createOrderBySchema(sanitizedSchema),
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
 * Creates an advanced search plugin for Elysia with type-safe query building.
 * Provides a model for search capabilities.
 *
 * @param options - Configuration options for the plugin {@link QueryOptionsBuilderOptions}
 *
 * @returns Configured Elysia plugin with search model
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
    .model((`queryOptionsBuilder${schemaName}` as const), _createSearchSchema(baseSchema))
    .as('scoped');