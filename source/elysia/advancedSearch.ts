import { TypeGuard, type Static, type TArray, type TObject, type TSchema, type TUnion } from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import { filterByKeyExclusion } from '#/data/data';
import type { AdvancedSearch } from '#/repository/types/advancedSearch';

const _createWhereClauseSchema = <TInferedSchema extends TSchema>(schema: TInferedSchema) => t.Object({
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

const _createPropertiesWhereClauseSchema = <TInferedObject extends TObject>(schema: TInferedObject) => {
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
};

const _createQSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Array(
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

const _createSelectedFieldsSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Array(t.KeyOf(schema));

export const createBaseSearchSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Composite([
    t.Object({
        $q: t.Optional(_createQSchema(schema)),
        $selectedFields: t.Optional(_createSelectedFieldsSchema(schema))
    }),
    t.Partial(
        t.Object(_createPropertiesWhereClauseSchema(schema))
    )
]);

export const createBaseSearchSchemaWithPagination = <TInferedObject extends TObject>(schema: TInferedObject) => t.Composite([
    createBaseSearchSchema(schema),
    t.Partial(t.Object({
        $limit: t.Number(),
        $offset: t.Number()
    }))
]);

export const advancedSearchPlugin = <TInferedObject extends TObject>(
    name: string,
    baseSchema: TInferedObject,
    additionalExcludedProps: string[] = []
) => new Elysia({
    name: `advancedSearchPlugin-${name}`,
    seed: baseSchema
})
    .model({
        [`advancedSearch${name}Query`]: createBaseSearchSchema(baseSchema),
        [`advancedSearch${name}QueryWithPagination`]: createBaseSearchSchemaWithPagination(baseSchema)
    })
    .macro({
        hasAdvancedSearch: {
            resolve: ({ query }) => {
                let rawAdvancedSearchQuery = query as ReturnType<typeof createBaseSearchSchema<typeof baseSchema>>;

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
                    '$offset',
                    ...additionalExcludedProps
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
    })
    .as('scoped');