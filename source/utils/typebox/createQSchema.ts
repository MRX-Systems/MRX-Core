import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

/**
 * Creates a search query schema that accepts either:
 * - A simple string for basic text search
 * - An object with selectedFields and value for targeted search
 *
 * @param schema - The base object schema to create search queries for ({@link TObject})
 *
 * @returns A union schema for search queries
 */
export const createQSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Union([
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
], {
    description: 'Search query that can be a simple string, an object with selected fields and value, or a number.',
    examples: [
        'search term',
        { selectedFields: [Object.keys(schema.properties)], value: 'search term' },
        42
    ]
});