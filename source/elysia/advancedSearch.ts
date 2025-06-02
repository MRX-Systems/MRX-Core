import { TypeGuard, type Static, type TArray, type TObject, type TSchema, type TUnion } from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import { filterByKeyExclusion } from '#/data/data';
import type { AdvancedSearch } from '#/repository/types/advancedSearch';
import type { OrderBy } from '#/repository/types/orderBy';

/**
 * Creates a where clause schema with appropriate operators based on the property type.
 * Boolean properties get fewer operators than other types.
 *
 * @param schema - The base property schema to create where clauses for
 * @returns A TypeBox object schema with where clause operators
 */
const _createWhereClauseSchema = <TInferedSchema extends TSchema>(schema: TInferedSchema) => {
    // Define basic operators that apply to all types
    const operators: Record<string, TSchema> = {
        $eq: ({ ...schema, description: 'Equal to the specified value', examples: [], example: undefined }),
        $neq: ({ ...schema, description: 'Not equal to the specified value', examples: [], example: undefined }),
        $isNull: t.Boolean()
    };

    // For string, number, date only
    if (
        TypeGuard.IsString(schema)
        || TypeGuard.IsNumber(schema)
        || TypeGuard.IsInteger(schema)
        || TypeGuard.IsDate(schema)
    ) {
        operators.$in = t.Array(schema, {
            description: 'Array of values to match against',
            minItems: 1,
            uniqueItems: true
        });
        operators.$nin = t.Array(schema, {
            description: 'Array of values to exclude from matching',
            minItems: 1,
            uniqueItems: true
        });
        operators.$like = t.String({
            description: 'Pattern to match against the string value. Supports SQL-like wildcards (%)'
        });
        operators.$nlike = t.String({
            description: 'Pattern to exclude from matching the string value. Supports SQL-like wildcards (%)'
        });
    }

    // For number, date only
    if (TypeGuard.IsNumber(schema)
        || TypeGuard.IsInteger(schema)
        || TypeGuard.IsDate(schema)
    ) {
        operators.$lt = ({ ...schema, description: 'Less than the specified value', examples: [], example: undefined });
        operators.$lte = ({ ...schema, description: 'Less than or equal to the specified value', examples: [], example: undefined });
        operators.$gt = ({ ...schema, description: 'Greater than the specified value', examples: [], example: undefined });
        operators.$gte = ({ ...schema, description: 'Greater than or equal to the specified value', examples: [], example: undefined });
        operators.$between = t.Tuple([schema, schema], {
            description: 'Range of values to match between (inclusive)'
        });
        operators.$nbetween = t.Tuple([schema, schema], {
            description: 'Range of values to exclude from matching (inclusive)'
        });
    }

    return t.Partial(t.Object(operators));
};


/**
 * Creates property schemas that support multiple query formats:
 * - Direct value matching
 * - Array of values for OR operations
 * - Where clause objects for complex filtering
 * - Array of where clause objects for multiple conditions
 *
 * @param schema - The base object schema to create property schemas for
 * @returns Record of property schemas with union types
 */
const _createPropertiesSchema = <TInferedObject extends TObject>(schema: TInferedObject) => {
    const { properties } = schema;
    const clauseSchema = {} as Record<
        string,
        TArray<
            TUnion<[
                ReturnType<typeof _createWhereClauseSchema>,
                TSchema
            ]>>
    >;

    for (const [key, propertySchema] of Object.entries(properties))
        clauseSchema[key] = t.Array(t.Union([
            _createWhereClauseSchema(propertySchema), // Array of where clauses: [{ $gt: 18 }, { $lt: 65 }]
            propertySchema // Array of values: ["john", "jane"]
        ]));

    return clauseSchema;
};

/**
 * Creates a search query schema that accepts either:
 * - A simple string for basic text search
 * - An object with selectedFields and value for targeted search
 *
 * @param schema - The base object schema to create search queries for
 * @returns A union schema for search queries
 */
const _createQSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Union([
    t.Undefined(),
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
 * Creates a schema for field selection in search results.
 *
 * @param schema - The base object schema to create field selection for
 * @returns An array schema of valid field names
 */
const _createSelectedFieldsSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Array(t.Union([
    t.KeyOf(schema),
    t.Literal('*')
]), {
    minItems: 1,
    description: 'Fields to select in the search results. Use "*" for all fields.',
    default: ['*']
});

/**
 * Creates a schema for order by clause in search results.
 *
 * @param schema - The base object schema to create order by for
 * @returns A tuple schema with field name and direction
 */
const _createOrderBySchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Tuple([
    t.Extract(t.KeyOf(schema), t.String()),
    t.Union([t.Literal('asc'), t.Literal('desc')])
], {
    description: 'Field to order by and direction. Use "asc" for ascending or "desc" for descending order.',
    examples: [
        ['createdAt', 'desc'],
        ['name', 'asc']
    ]
});

/**
 * Creates a base search schema for an object, allowing querying by properties with various operators.
 * Supports basic equality and inequality, as well as type-specific operators for strings and numbers.
 *
 * @param schema - The base object schema to create search schemas for
 * @returns A TypeBox object schema for base search with property-specific filters
 */
export const createBaseSearchSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Partial(t.Object({
    $q: _createQSchema(schema),
    $selectedFields: _createSelectedFieldsSchema(schema),
    $orderBy: _createOrderBySchema(schema),
    ..._createPropertiesSchema(schema)
}));

/**
 * Creates a base search schema with pagination support.
 * Extends the base search schema with optional limit and offset parameters.
 *
 * @param schema - The base object schema to create search schemas for
 * @returns A composite schema for base search with pagination
 */
export const createBaseSearchSchemaWithPagination = <TInferedObject extends TObject>(schema: TInferedObject) => t.Composite([
    t.Partial(t.Object({
        $limit: t.Number({
            description: 'Maximum number of results to return',
            default: 100,
            minimum: 1
        }),
        $offset: t.Number({
            description: 'Number of results to skip before starting to collect the result set',
            default: 0,
            minimum: 0
        })
    })),
    createBaseSearchSchema(schema)
]);

/**
 * Creates an advanced search plugin for Elysia with type-safe query building.
 * Provides two models: basic search and search with pagination.
 *
 * @param schemaName - Name identifier for the generated schemas
 * @param baseSchema - The base TypeBox object schema to build search capabilities for
 * @param additionalExcludedProps - Additional property names to exclude from processing
 * @returns Configured Elysia plugin with search models and macro
 */
export const advancedSearchPlugin = <
    const TSchemaName extends string,
    TInferedObject extends TObject
>(
    schemaName: TSchemaName,
    baseSchema: TInferedObject,
    additionalExcludedProps: string[] = []
) => {
    const DEFAULT_LIMIT = 100;
    const DEFAULT_OFFSET = 0;
    const EXCLUDED_QUERY_PARAMS: readonly string[] = [
        '$selectedFields',
        '$q',
        '$limit',
        '$offset',
        '$orderBy',
        ...additionalExcludedProps
    ] as const;

    return new Elysia({
        name: `advancedSearchPlugin-${schemaName}`,
        seed: baseSchema
    })
        // .model((`advancedSearch${schemaName}` as const), createBaseSearchSchema(baseSchema))
        // .model((`advancedSearch${schemaName}WithPagination` as const), createBaseSearchSchemaWithPagination(baseSchema))
        .macro({
            hasAdvancedSearch: {
                resolve: ({ query }) => {
                    let rawAdvancedSearchQuery = query as Static<ReturnType<typeof createBaseSearchSchemaWithPagination<typeof baseSchema>>>;

                    const result: {
                        readonly advancedSearch: AdvancedSearch<Static<TInferedObject>>[];
                        readonly selectedFields: (keyof Static<TInferedObject>)[];
                        readonly orderBy?: OrderBy<Static<TInferedObject>>;
                        readonly pagination?: {
                            readonly limit: number;
                            readonly offset: number;
                        };
                    } = {
                        advancedSearch: [],
                        selectedFields: rawAdvancedSearchQuery.$selectedFields || ['*'],
                        ...(rawAdvancedSearchQuery.$orderBy
                            ? {
                                orderBy: rawAdvancedSearchQuery.$orderBy as OrderBy<Static<TInferedObject>>
                            }
                            : {}),
                        pagination: {
                            limit: rawAdvancedSearchQuery.$limit || DEFAULT_LIMIT,
                            offset: rawAdvancedSearchQuery.$offset || DEFAULT_OFFSET
                        }
                    };

                    // Get a copy of $q parameter for processing after processing other parameters
                    const { $q } = rawAdvancedSearchQuery;

                    // Remove processed parameters before handling property-specific filters
                    rawAdvancedSearchQuery = filterByKeyExclusion(
                        rawAdvancedSearchQuery,
                        [...(EXCLUDED_QUERY_PARAMS as (keyof typeof rawAdvancedSearchQuery)[])],
                        true
                    );

                    // Process property-specific where clauses
                    for (const [key, value] of Object.entries(rawAdvancedSearchQuery)) {
                        const values: unknown[] = Array.isArray(value) ? value : [value];

                        values.forEach((val: unknown, index: number) => {
                            if (!result.advancedSearch[index])
                                result.advancedSearch[index] = {};

                            (result.advancedSearch[index] as Record<string, unknown>)[key] = val;
                        });
                    }

                    // Process search query parameter
                    if ($q)
                        if (typeof $q === 'string' || typeof $q === 'number') {
                            result.advancedSearch.forEach((item) => {
                                Object.assign(item, {
                                    $q
                                });
                            });
                        } else if (typeof $q === 'object'
                            && $q.selectedFields
                            && Array.isArray($q.selectedFields)
                            && $q.selectedFields.length > 0
                            && $q.value
                            && (typeof $q.value === 'string' || typeof $q.value === 'number')
                        ) {
                            const { selectedFields, value } = $q;
                            result.advancedSearch.forEach((item) => {
                                Object.assign(item, {
                                    $q: {
                                        selectedFields,
                                        value
                                    }
                                });
                            });
                        }

                    return result;
                }
            }
        })
        .as('scoped');
};


