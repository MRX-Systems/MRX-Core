import { TypeGuard, type Static, type TArray, type TObject, type TSchema, type TUnion } from '@sinclair/typebox';
import { Elysia, t } from 'elysia';
import { filterByKeyExclusion } from '@basalt-lab/basalt-helper/data';

import type { AdvancedSearch } from '#/types/data/advancedSearch';

/**
 * Creates a TypeBox schema for the $q (query) parameter used in advanced search.
 * The $q parameter can be an array of either:
 * 1. Search objects with selected fields and search value
 * 2. Simple string values
 *
 * @typeParam TInferedObject - The inferred schema type for the field to generate operators for.
 * @param schema - The base schema to derive valid field keys from
 * @returns TypeBox array schema for the $q parameter
 */
function _createQSchema<TInferedObject extends TObject>(schema: TInferedObject): typeof qSchema {
    const qSchema = t.Array(
        t.Union([
            t.Partial(t.Object({
                selectedFields: t.Union([
                    t.Array(t.KeyOf(schema)),
                    t.KeyOf(schema)
                ]),
                value: t.String()
            })),
            t.String()
        ])
    );
    return qSchema;
}

/**
 * Creates a TypeBox schema for the $selectedFields parameter specifying which
 * fields to return in the query results.
 *
 * @typeParam TInferedObject - The inferred schema type for the field to generate operators for.
 * @param schema - The base schema to derive valid field keys from
 * @returns TypeBox array schema for $selectedFields
 */
function _createSelectedFieldsSchema<TInferedObject extends TObject>(schema: TInferedObject): typeof selectedFieldsSchema {
    const selectedFieldsSchema = t.Array(t.KeyOf(schema));
    return selectedFieldsSchema;
}

/**
 * Generates a where clause condition schema for a specific field type.
 * Includes type-appropriate comparison operators (e.g., numeric ranges, string patterns).
 *
 * @typeParam TInferedSchema - The inferred schema type for the field to generate operators for.
 * @param schema - The schema for the field to generate operators for.
 * @returns TypeBox object schema with available query operators
 */
function _createWhereClauseSchema<TInferedSchema extends TSchema>(schema: TInferedSchema): typeof whereClauseSchema {
    const whereClauseSchema = t.Object({
        // Basic operators
        $eq: schema,
        $neq: schema,

        // Type-specific operators
        ...(
            !TypeGuard.IsBoolean(schema)
                ? {
                    $lt: schema,
                    $lte: schema,
                    $gt: schema,
                    $gte: schema,
                    $in: t.Array(schema),
                    $nin: t.Array(schema),
                    $between: t.Tuple([schema, schema]),
                    $nbetween: t.Tuple([schema, schema]),
                    $like: t.String(),
                    $nlike: t.String()
                }
                : {}
        ),
        // Null operators
        $isNull: t.Boolean()
    });
    return whereClauseSchema;
}

/**
 * Creates a where clause schema for all properties in the base schema.
 * Each property can accept either:
 * 1. An array of where clause conditions
 * 2. An array of the base schema type
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate property conditions for.
 * @param schema - The base object schema to generate property conditions for
 *
 * @returns Mapped TypeBox schema for all properties
 */
function _createPropertiesWhereClauseSchema<TInferedObject extends TObject>(schema: TInferedObject): typeof clauseSchema {
    const { properties } = schema;
    const clauseSchema = {} as Record<
        string,
        TUnion<[
            TArray<ReturnType<typeof _createWhereClauseSchema<TSchema>>>,
            ReturnType<typeof _createWhereClauseSchema<TSchema>>,
            TArray,
            TSchema
        ]>
    >;

    for (const [key, propertySchema] of Object.entries(properties)) {
        const whereSchema = _createWhereClauseSchema(propertySchema);
        (clauseSchema[key] as Record<string, unknown>) = t.Array(
            t.Union([
                t.Partial(whereSchema),
                propertySchema
            ])
        );
    }

    return clauseSchema;
}

/**
 * Constructs a complete advanced search schema combining:
 * - Global query parameters ($q, $selectedFields)
 * - Property-specific where clauses
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate search capabilities for.
 * @param schema - The base schema to build search capabilities for
 *
 * @returns Composite TypeBox schema for advanced search
 */
export const buildBaseSearchSchema = <TInferedObject extends TObject>(schema: TInferedObject): typeof searchSchema => {
    const searchSchema = t.Composite([
        t.Object({
            $q: t.Optional(_createQSchema(schema)),
            $selectedFields: t.Optional(_createSelectedFieldsSchema(schema))
        }),
        t.Partial(
            t.Object(_createPropertiesWhereClauseSchema(schema))
        )
    ]);
    return searchSchema;
};

/**
 * Constructs a complete advanced search schema with pagination combining:
 * - Global query parameters ($q, $selectedFields, $limit, $offset)
 * - Property-specific where clauses
 * - Pagination parameters ($limit, $offset)
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate search capabilities for.
 * @param schema - The base schema to build search capabilities for
 *
 * @returns Composite TypeBox schema for advanced search with pagination
 */
export const buildBaseSearchSchemaWithPagination = <TInferedObject extends TObject>(schema: TInferedObject): typeof searchSchemaWithPagination => {
    const searchSchemaWithPagination = t.Composite([
        buildBaseSearchSchema(schema),
        t.Partial(t.Object({
            $limit: (t.Number()),
            $offset: (t.Number())
        }))
    ]);
    return searchSchemaWithPagination;
};

/**
 * Elysia plugin providing advanced search capabilities for a given schema
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate search capabilities for.
 * @param name - Plugin name for documentation purposes
 * @param baseSchema - The TypeBox schema to enable searching on
 *
 * @returns Configured Elysia plugin with advanced search features
 */
export const advancedSearchPlugin = <TInferedObject extends TObject>(name: string, baseSchema: TInferedObject): typeof app => {
    const app = new Elysia({
        name: `advancedSearchPlugin-${name}`,
        seed: baseSchema
    })
        .model({
            [`advancedSearch${name}Query`]: buildBaseSearchSchema(baseSchema),
            [`advancedSearch${name}QueryWithPagination`]: buildBaseSearchSchemaWithPagination(baseSchema)
        })
        .macro({
            hasAdvancedSearch: {
                resolve: ({ query }) => {
                    let rawAdvancedSearchQuery = query as ReturnType<typeof buildBaseSearchSchema<typeof baseSchema>>;

                    const result: {
                        advancedSearch: AdvancedSearch<Static<TInferedObject>>[];
                        selectedFields: string[];
                        pagination?: {
                            limit: number;
                            offset: number;
                        };
                    } = {
                        advancedSearch: [],
                        selectedFields: rawAdvancedSearchQuery.$selectedFields || ['*'],
                        pagination: {
                            limit: rawAdvancedSearchQuery.$limit || 100,
                            offset: rawAdvancedSearchQuery.$offset || 0
                        }
                    };

                    // Process $q parameter
                    if (query.$q) {
                        const qItems = Array.isArray(query.$q)
                            ? query.$q
                            : [query.$q];
                        result.advancedSearch.push(...qItems.map(($q) => ({ $q })));
                    }

                    // Delete processed parameters
                    rawAdvancedSearchQuery = filterByKeyExclusion(rawAdvancedSearchQuery, [
                        '$selectedFields',
                        '$q',
                        '$limit',
                        '$offset'
                    ], true);

                    // Process property-specific where clauses (sanitized to AdvancedSearch[])
                    for (const [key, value] of Object.entries(rawAdvancedSearchQuery)) {
                        const values = Array.isArray(value) ? value : [value];

                        values.forEach((val, index) => {
                            if (!result.advancedSearch[index])
                                result.advancedSearch[index] = {};

                            (result.advancedSearch[index] as Record<string, unknown>)[key] = val;
                        });
                    }

                    return result;
                }
            }
        });
    return app;
};

