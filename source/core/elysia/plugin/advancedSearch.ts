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
 * @param schema - The base schema to derive valid field keys from. ({@link TInferedObject})
 *
 * @returns TypeBox array schema for the $q parameter in advanced search.
 *
 * @example
 * ```typescript
 * const userSchema = t.Object({
 *   id: t.Number(),
 *   name: t.String(),
 *   email: t.String()
 * });
 *
 * const qSchema = _createQSchema(userSchema);
 * // This would allow queries like:
 * // $q=["john"] - Search for "john" across all fields
 * // $q=[{"selectedFields":["name","email"],"value":"john"}] - Search for "john" in name and email fields
 * ```
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
 * @param schema - The base schema to derive valid field keys from. ({@link TInferedObject})
 *
 * @returns TypeBox array schema for $selectedFields
 *
 * @example
 * ```typescript
 * const userSchema = t.Object({
 *   id: t.Number(),
 *   name: t.String(),
 *   email: t.String()
 * });
 *
 * const selectedFieldsSchema = _createSelectedFieldsSchema(userSchema);
 * // This would allow queries like:
 * // $selectedFields=["name","email"] - Return only name and email fields
 * ```
 */
function _createSelectedFieldsSchema<TInferedObject extends TObject>(schema: TInferedObject): typeof selectedFieldsSchema {
    const selectedFieldsSchema = t.Array(t.KeyOf(schema));
    return selectedFieldsSchema;
}

/**
 * Generates a where clause condition schema for a specific field type.
 * Includes type-appropriate comparison operators (e.g., numeric ranges, string patterns).
 * The schema automatically adapts based on the field type, providing only relevant operators.
 *
 * @typeParam TInferedSchema - The inferred schema type for the field to generate operators for.
 * @param schema - The schema for the field to generate operators for. ({@link TInferedSchema})
 *
 * @returns TypeBox object schema with available query operators
 *
 * @example
 * ```typescript
 * const stringSchema = t.String();
 * const whereClauseSchema = _createWhereClauseSchema(stringSchema);
 * // This would create a schema supporting operators like:
 * // $eq, $neq, $in, $nin, $like, $nlike, etc.
 *
 * const booleanSchema = t.Boolean();
 * const booleanWhereClauseSchema = _createWhereClauseSchema(booleanSchema);
 * // This would only include boolean-appropriate operators:
 * // $eq, $neq, $isNull
 * ```
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
 * @param schema - The base object schema to generate property conditions for. ({@link TInferedObject})
 *
 * @returns Mapped TypeBox schema for all properties in the advanced search.
 *
 * @example
 * ```typescript
 * const userSchema = t.Object({
 *   id: t.Number(),
 *   name: t.String()
 * });
 *
 * const propertiesSchema = _createPropertiesWhereClauseSchema(userSchema);
 * // This would allow queries like:
 * // id=[{"$eq":1}] - Where id equals 1
 * // name=[{"$like":"john"}] - Where name contains "john"
 * // id=[1,2,3] - Where id is 1, 2, or 3
 * ```
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
 * This function creates a TypeBox schema that can be used to validate and type
 * complex query parameters for search operations. The schema supports both global
 * full-text search via $q and field-specific filtering with comparison operators.
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate search capabilities for.
 * @param schema - The base schema to build search capabilities for. ({@link TInferedObject})
 *
 * @returns Composite TypeBox schema for advanced search.
 *
 * @example
 * ```typescript
 * const userSchema = t.Object({
 *   id: t.Number(),
 *   name: t.String(),
 *   email: t.String(),
 *   active: t.Boolean()
 * });
 *
 * const searchSchema = buildBaseSearchSchema(userSchema);
 * // This creates a composite schema that allows complex queries like:
 * // $q=["john"] - Search for "john" across all fields
 * // $selectedFields=["name","email"] - Only return name and email fields
 * // id=[{"$gt":100}] - Where id > 100
 * // active=[true] - Where active is true
 * // name=[{"$like":"john"}] - Where name contains "john"
 * ```
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
 * - Global query parameters ($q, $selectedFields)
 * - Property-specific where clauses
 * - Pagination parameters ($limit, $offset)
 *
 * This extends the base search schema to include pagination capabilities,
 * allowing clients to request specific page sizes and offsets for large result sets.
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate search capabilities for.
 * @param schema - The base schema to build search capabilities for. ({@link TInferedObject})
 *
 * @returns Composite TypeBox schema for advanced search with pagination.
 *
 * @example
 * ```typescript
 * const userSchema = t.Object({
 *   id: t.Number(),
 *   name: t.String()
 * });
 *
 * const searchSchema = buildBaseSearchSchemaWithPagination(userSchema);
 * // This creates a schema that allows all standard search queries plus:
 * // $limit=10 - Limit results to 10 records
 * // $offset=20 - Skip the first 20 records
 * //
 * // Complete example:
 * // ?name=[{"$like":"Smith"}]&$limit=10&$offset=20
 * ```
 */
export const buildBaseSearchSchemaWithPagination = <TInferedObject extends TObject>(schema: TInferedObject): typeof searchSchemaWithPagination => {
    const searchSchemaWithPagination = t.Composite([
        buildBaseSearchSchema(schema),
        t.Partial(t.Object({
            $limit: t.Number(),
            $offset: t.Number()
        }))
    ]);
    return searchSchemaWithPagination;
};

/**
 * The `advancedSearchPlugin` creates an Elysia plugin that provides powerful search
 * capabilities based on a TypeBox schema. It registers models for validation and
 * implements a macro that transforms query parameters into structured search objects.
 *
 * The plugin processes query parameters into three main components:
 * 1. `advancedSearch` - An array of search conditions derived from both $q and field-specific filters
 * 2. `selectedFields` - Array of fields to include in query results
 * 3. `pagination` - Limit and offset parameters for result pagination
 *
 * These components can then be used directly with database repository methods.
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate search capabilities for.
 * @param name - Plugin name for identification and model registration.
 * @param baseSchema - The TypeBox schema to enable searching on. ({@link TInferedObject})
 *
 * @returns Configured Elysia plugin with advanced search features
 *
 * @example
 * ```typescript
 * // Define a schema for your data model
 * const userSchema = t.Object({
 *   id: t.Number(),
 *   name: t.String(),
 *   email: t.String(),
 *   createdAt: t.String()
 * });
 *
 * // Create an Elysia app with the advancedSearchPlugin
 * const app = new Elysia()
 *   .use(advancedSearchPlugin('user', userSchema))
 *   .get('/users', async ({ advancedSearch, selectedFields, pagination }) => {
 *     // advancedSearch contains parsed query parameters
 *     // selectedFields contains the fields to return
 *     // pagination contains limit and offset values
 *
 *     const users = await db.getRepository('users').find({
 *       advancedSearch,
 *       selectedFields,
 *       limit: pagination.limit,
 *       offset: pagination.offset
 *     });
 *
 *     return users;
 *   }, {
 *     query: 'advancedSearchuserQueryWithPagination',
 *     hasAdvancedSearch: true
 *   });
 * ```
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

                    // The additional context object to be returned
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

