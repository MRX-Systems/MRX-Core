import { expect, test, describe } from 'bun:test';
import { Elysia, t } from 'elysia';

import { advancedSearchPlugin } from '#/core/elysia/plugin/advancedSearch';

function tranformQueryToURLSearchParams(query: Record<string, string | string[] | undefined>): URLSearchParams {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (Array.isArray(value))
            value.forEach((v) => searchParams.append(key, v));
        else if (value)
            searchParams.set(key, value);
    });
    return searchParams;
}

describe('AdvancedSearch Plugin', () => {
    test('should return an empty array when no query is provided', async () => {
        const app = new Elysia()
            .use(advancedSearchPlugin)
            .get('/', ({ advancedSearch }) => ({ advancedSearch }), {
                hasAdvancedSearch: true
            });
        const response = await app.handle(new Request('http://localhost:3000/'));
        const data = await response.json();
        expect(data).toEqual({ advancedSearch: [] });
    });

    test('should return an array with a single object when a simple query is provided', async () => {
        const app = new Elysia()
            .use(advancedSearchPlugin)
            .get('/', ({ advancedSearch }) => ({ advancedSearch }), {
                hasAdvancedSearch: true,
                query: t.Object({
                    name: t.String()
                })
            });
        const query = tranformQueryToURLSearchParams({
            name: 'John'
        });
        const response = await app.handle(
            new Request(`http://localhost:3000/?${query.toString()}`)
        );
        const data = await response.json();
        expect(data).toEqual({ advancedSearch: [{ name: 'John' }] });
    });

    test('should return an array with multiple objects when an array query is provided', async () => {
        const app = new Elysia()
            .use(advancedSearchPlugin)
            .get('/', ({ advancedSearch }) => ({ advancedSearch }), {
                hasAdvancedSearch: true,
                query: t.Object({
                    name: t.Array(t.String())
                })
            });
        const query = tranformQueryToURLSearchParams({
            name: ['John', 'Doe']
        });
        const response = await app.handle(
            new Request(`http://localhost:3000/?${query.toString()}`)
        );
        const data = await response.json();
        expect(data).toEqual({
            advancedSearch: [{ name: 'John' }, { name: 'Doe' }]
        });
    });

    test('should return an array with an object containing multiple properties', async () => {
        const app = new Elysia()
            .use(advancedSearchPlugin)
            .get('/', ({ advancedSearch }) => ({ advancedSearch }), {
                hasAdvancedSearch: true,
                query: t.Object({
                    name: t.String(),
                    age: t.Number()
                })
            });
        const query = tranformQueryToURLSearchParams({
            name: 'John',
            age: '30'
        });
        const response = await app.handle(
            new Request(`http://localhost:3000/?${query.toString()}`)
        );
        const data = await response.json();
        expect(data).toEqual({
            advancedSearch: [{ name: 'John', age: 30 }]
        });
    });

    test('should', async () => {
        const app = new Elysia()
            .use(advancedSearchPlugin)
            .get('/', ({ advancedSearch }) => ({ advancedSearch }), {
                hasAdvancedSearch: true,
                query: t.Object({
                    name: t.Union([
                        t.String(),
                        t.Ref(' whereClause')
                    ]),
                })
            });
    });
});